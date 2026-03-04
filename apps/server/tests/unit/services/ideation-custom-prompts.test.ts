import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IdeationService } from '@/services/ideation-service.js';
import type { EventEmitter } from '@/lib/events.js';
import type { SettingsService } from '@/services/settings-service.js';
import type { FeatureLoader } from '@/services/feature-loader.js';
import * as secureFs from '@/lib/secure-fs.js';
import * as platform from '@automaker/platform';
import * as utils from '@automaker/utils';
import type { CustomIdeationPrompt, CustomPromptHistoryEntry } from '@automaker/types';

// Create shared mock instances
const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
}));

const mockValidateWorkingDirectory = vi.hoisted(() => vi.fn());

// Mock dependencies
vi.mock('@/lib/secure-fs.js');
vi.mock('@automaker/platform');
vi.mock('@automaker/utils', async () => {
  const actual = await vi.importActual<typeof import('@automaker/utils')>('@automaker/utils');
  return {
    ...actual,
    createLogger: vi.fn(() => mockLogger),
    loadContextFiles: vi.fn(),
    isAbortError: vi.fn(),
  };
});
vi.mock('@/providers/provider-factory.js');
vi.mock('@/lib/sdk-options.js', () => ({
  createChatOptions: vi.fn(() => ({ model: 'claude-sonnet-4-6', systemPrompt: 'test' })),
  validateWorkingDirectory: mockValidateWorkingDirectory,
}));

describe('IdeationService - Custom Prompts', () => {
  let service: IdeationService;
  let mockEvents: EventEmitter;
  const testProjectPath = '/test/project';

  beforeEach(() => {
    vi.clearAllMocks();

    mockEvents = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
    } as unknown as EventEmitter;

    const mockSettingsService = {
      getCredentials: vi.fn().mockResolvedValue({}),
      getGlobalSettings: vi.fn().mockResolvedValue({}),
    } as unknown as SettingsService;

    const mockFeatureLoader = {
      getAll: vi.fn().mockResolvedValue([]),
    } as unknown as FeatureLoader;

    // Mock platform functions
    vi.mocked(platform.ensureIdeationDir).mockResolvedValue(undefined);
    vi.mocked(platform.getCustomPromptsDir).mockReturnValue(
      '/test/project/.automaker/ideation/custom-prompts'
    );
    vi.mocked(platform.getCustomPromptPath).mockImplementation(
      (_proj, id) => `/test/project/.automaker/ideation/custom-prompts/${id}.json`
    );
    vi.mocked(platform.getPromptHistoryPath).mockReturnValue(
      '/test/project/.automaker/ideation/prompt-history.json'
    );

    vi.mocked(utils.loadContextFiles).mockResolvedValue({
      formattedPrompt: 'Test context',
      files: [],
    });

    service = new IdeationService(mockEvents, mockSettingsService, mockFeatureLoader);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Custom Prompt CRUD
  // ============================================================================

  describe('saveCustomPrompt', () => {
    it('should save a custom prompt and return it with generated id', async () => {
      vi.mocked(secureFs.mkdir).mockResolvedValue(undefined);
      vi.mocked(secureFs.writeFile).mockResolvedValue(undefined);

      const result = await service.saveCustomPrompt(testProjectPath, {
        title: 'Test Prompt',
        prompt: 'Generate ideas about testing',
        category: 'feature',
      });

      expect(result.id).toMatch(/^custom-/);
      expect(result.title).toBe('Test Prompt');
      expect(result.prompt).toBe('Generate ideas about testing');
      expect(result.category).toBe('feature');
      expect(result.isTemplate).toBe(false);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(mockValidateWorkingDirectory).toHaveBeenCalledWith(testProjectPath);
      expect(secureFs.writeFile).toHaveBeenCalled();
    });

    it('should save a template prompt', async () => {
      vi.mocked(secureFs.mkdir).mockResolvedValue(undefined);
      vi.mocked(secureFs.writeFile).mockResolvedValue(undefined);

      const result = await service.saveCustomPrompt(testProjectPath, {
        title: 'Template',
        prompt: 'template text',
        isTemplate: true,
        templateFields: ['topic', 'focus'],
      });

      expect(result.isTemplate).toBe(true);
      expect(result.templateFields).toEqual(['topic', 'focus']);
    });
  });

  describe('listCustomPrompts', () => {
    it('should return empty array when directory does not exist', async () => {
      vi.mocked(secureFs.access).mockRejectedValue(new Error('ENOENT'));

      const result = await service.listCustomPrompts(testProjectPath);

      expect(result).toEqual([]);
      expect(mockValidateWorkingDirectory).toHaveBeenCalledWith(testProjectPath);
    });

    it('should list and sort prompts by updatedAt descending', async () => {
      vi.mocked(secureFs.access).mockResolvedValue(undefined);
      vi.mocked(secureFs.readdir).mockResolvedValue(['a.json', 'b.json'] as any);

      const promptA: CustomIdeationPrompt = {
        id: 'custom-a',
        title: 'Older',
        prompt: 'older prompt',
        isTemplate: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      const promptB: CustomIdeationPrompt = {
        id: 'custom-b',
        title: 'Newer',
        prompt: 'newer prompt',
        isTemplate: false,
        createdAt: '2024-06-01T00:00:00Z',
        updatedAt: '2024-06-01T00:00:00Z',
      };

      vi.mocked(secureFs.readFile)
        .mockResolvedValueOnce(JSON.stringify(promptA))
        .mockResolvedValueOnce(JSON.stringify(promptB));

      const result = await service.listCustomPrompts(testProjectPath);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('custom-b'); // newer first
      expect(result[1].id).toBe('custom-a');
    });

    it('should skip non-json files', async () => {
      vi.mocked(secureFs.access).mockResolvedValue(undefined);
      vi.mocked(secureFs.readdir).mockResolvedValue(['a.json', 'readme.md'] as any);

      const prompt: CustomIdeationPrompt = {
        id: 'custom-a',
        title: 'A',
        prompt: 'p',
        isTemplate: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      vi.mocked(secureFs.readFile).mockResolvedValueOnce(JSON.stringify(prompt));

      const result = await service.listCustomPrompts(testProjectPath);

      expect(result).toHaveLength(1);
      expect(secureFs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should skip files with invalid JSON', async () => {
      vi.mocked(secureFs.access).mockResolvedValue(undefined);
      vi.mocked(secureFs.readdir).mockResolvedValue(['bad.json', 'good.json'] as any);

      const goodPrompt: CustomIdeationPrompt = {
        id: 'custom-good',
        title: 'Good',
        prompt: 'good',
        isTemplate: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(secureFs.readFile)
        .mockResolvedValueOnce('not valid json {{{')
        .mockResolvedValueOnce(JSON.stringify(goodPrompt));

      const result = await service.listCustomPrompts(testProjectPath);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('custom-good');
    });
  });

  describe('getCustomPrompt', () => {
    it('should return prompt when found', async () => {
      const prompt: CustomIdeationPrompt = {
        id: 'custom-123',
        title: 'Test',
        prompt: 'test',
        isTemplate: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      vi.mocked(secureFs.readFile).mockResolvedValue(JSON.stringify(prompt));

      const result = await service.getCustomPrompt(testProjectPath, 'custom-123');

      expect(result).toEqual(prompt);
      expect(mockValidateWorkingDirectory).toHaveBeenCalledWith(testProjectPath);
    });

    it('should return null when not found', async () => {
      vi.mocked(secureFs.readFile).mockRejectedValue(new Error('ENOENT'));

      const result = await service.getCustomPrompt(testProjectPath, 'custom-nonexistent');

      expect(result).toBeNull();
    });

    it('should reject path traversal in promptId', async () => {
      await expect(
        service.getCustomPrompt(testProjectPath, 'custom-../../../etc/passwd')
      ).rejects.toThrow('Invalid prompt ID');

      await expect(service.getCustomPrompt(testProjectPath, 'custom-foo/bar')).rejects.toThrow(
        'Invalid prompt ID'
      );

      await expect(service.getCustomPrompt(testProjectPath, 'custom-foo\\bar')).rejects.toThrow(
        'Invalid prompt ID'
      );
    });
  });

  describe('updateCustomPrompt', () => {
    it('should update and return the prompt', async () => {
      const existing: CustomIdeationPrompt = {
        id: 'custom-123',
        title: 'Original',
        prompt: 'original',
        isTemplate: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      vi.mocked(secureFs.readFile).mockResolvedValue(JSON.stringify(existing));
      vi.mocked(secureFs.writeFile).mockResolvedValue(undefined);

      const result = await service.updateCustomPrompt(testProjectPath, 'custom-123', {
        title: 'Updated',
      });

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Updated');
      expect(result!.prompt).toBe('original'); // unchanged
      expect(new Date(result!.updatedAt).getTime()).toBeGreaterThan(
        new Date(existing.updatedAt).getTime()
      );
      expect(mockValidateWorkingDirectory).toHaveBeenCalledWith(testProjectPath);
    });

    it('should return null when prompt not found', async () => {
      vi.mocked(secureFs.readFile).mockRejectedValue(new Error('ENOENT'));

      const result = await service.updateCustomPrompt(testProjectPath, 'custom-missing', {
        title: 'x',
      });

      expect(result).toBeNull();
    });

    it('should reject path traversal in promptId', async () => {
      await expect(
        service.updateCustomPrompt(testProjectPath, '../secret', { title: 'x' })
      ).rejects.toThrow('Invalid prompt ID');
    });
  });

  describe('deleteCustomPrompt', () => {
    it('should return true when successfully deleted', async () => {
      vi.mocked(secureFs.unlink).mockResolvedValue(undefined);

      const result = await service.deleteCustomPrompt(testProjectPath, 'custom-123');

      expect(result).toBe(true);
      expect(mockValidateWorkingDirectory).toHaveBeenCalledWith(testProjectPath);
    });

    it('should return false when prompt does not exist', async () => {
      vi.mocked(secureFs.unlink).mockRejectedValue(new Error('ENOENT'));

      const result = await service.deleteCustomPrompt(testProjectPath, 'custom-missing');

      expect(result).toBe(false);
    });

    it('should reject path traversal in promptId', async () => {
      await expect(service.deleteCustomPrompt(testProjectPath, 'custom-../../etc')).rejects.toThrow(
        'Invalid prompt ID'
      );
    });
  });

  // ============================================================================
  // Prompt History
  // ============================================================================

  describe('getPromptHistory', () => {
    it('should return empty array when no history exists', async () => {
      vi.mocked(secureFs.readFile).mockRejectedValue(new Error('ENOENT'));

      const result = await service.getPromptHistory(testProjectPath);

      expect(result).toEqual([]);
      expect(mockValidateWorkingDirectory).toHaveBeenCalledWith(testProjectPath);
    });

    it('should return existing history entries', async () => {
      const history: CustomPromptHistoryEntry[] = [
        {
          id: 'history-1',
          promptText: 'test prompt',
          category: 'feature',
          usedAt: '2024-01-01T00:00:00Z',
          suggestionsCount: 5,
        },
      ];
      vi.mocked(secureFs.readFile).mockResolvedValue(JSON.stringify(history));

      const result = await service.getPromptHistory(testProjectPath);

      expect(result).toHaveLength(1);
      expect(result[0].promptText).toBe('test prompt');
    });
  });

  describe('addToPromptHistory', () => {
    it('should prepend new entry to history', async () => {
      const existingHistory: CustomPromptHistoryEntry[] = [
        {
          id: 'history-1',
          promptText: 'old prompt',
          category: 'feature',
          usedAt: '2024-01-01T00:00:00Z',
          suggestionsCount: 3,
        },
      ];
      vi.mocked(secureFs.readFile).mockResolvedValue(JSON.stringify(existingHistory));
      vi.mocked(secureFs.writeFile).mockResolvedValue(undefined);

      await service.addToPromptHistory(testProjectPath, {
        promptText: 'new prompt',
        category: 'technical',
        usedAt: '2024-06-01T00:00:00Z',
        suggestionsCount: 10,
      });

      expect(mockValidateWorkingDirectory).toHaveBeenCalledWith(testProjectPath);
      expect(secureFs.writeFile).toHaveBeenCalled();

      // Verify the written content has new entry first
      const writeCall = vi.mocked(secureFs.writeFile).mock.calls[0];
      const written = JSON.parse(writeCall[1] as string) as CustomPromptHistoryEntry[];
      expect(written[0].promptText).toBe('new prompt');
      expect(written[0].id).toMatch(/^history-/);
      expect(written[1].promptText).toBe('old prompt');
    });

    it('should trim history to 100 entries', async () => {
      const existingHistory: CustomPromptHistoryEntry[] = Array.from({ length: 100 }, (_, i) => ({
        id: `history-${i}`,
        promptText: `prompt ${i}`,
        usedAt: '2024-01-01T00:00:00Z',
        suggestionsCount: 1,
      }));
      vi.mocked(secureFs.readFile).mockResolvedValue(JSON.stringify(existingHistory));
      vi.mocked(secureFs.writeFile).mockResolvedValue(undefined);

      await service.addToPromptHistory(testProjectPath, {
        promptText: 'newest',
        usedAt: '2024-06-01T00:00:00Z',
        suggestionsCount: 5,
      });

      const writeCall = vi.mocked(secureFs.writeFile).mock.calls[0];
      const written = JSON.parse(writeCall[1] as string) as CustomPromptHistoryEntry[];
      expect(written).toHaveLength(100); // trimmed from 101
      expect(written[0].promptText).toBe('newest');
    });
  });

  // ============================================================================
  // Security - validateWorkingDirectory
  // ============================================================================

  describe('Security', () => {
    it('should call validateWorkingDirectory on all custom prompt methods', async () => {
      // Set up minimal mocks
      vi.mocked(secureFs.access).mockRejectedValue(new Error('ENOENT'));
      vi.mocked(secureFs.readFile).mockRejectedValue(new Error('ENOENT'));
      vi.mocked(secureFs.unlink).mockRejectedValue(new Error('ENOENT'));
      vi.mocked(secureFs.mkdir).mockResolvedValue(undefined);
      vi.mocked(secureFs.writeFile).mockResolvedValue(undefined);

      // Call each method
      await service.listCustomPrompts(testProjectPath);
      await service.getCustomPrompt(testProjectPath, 'custom-123');
      await service.updateCustomPrompt(testProjectPath, 'custom-123', { title: 'x' });
      await service.deleteCustomPrompt(testProjectPath, 'custom-123');
      await service.getPromptHistory(testProjectPath);
      await service.addToPromptHistory(testProjectPath, {
        promptText: 'test',
        usedAt: new Date().toISOString(),
        suggestionsCount: 0,
      });
      await service.saveCustomPrompt(testProjectPath, {
        title: 'T',
        prompt: 'P',
      });

      // Each method should have called validateWorkingDirectory
      // Note: updateCustomPrompt internally calls getCustomPrompt which also validates,
      // and addToPromptHistory internally calls getPromptHistory which also validates,
      // so total is 7 direct + 2 internal = 9
      expect(mockValidateWorkingDirectory).toHaveBeenCalledTimes(9);
      for (const call of mockValidateWorkingDirectory.mock.calls) {
        expect(call[0]).toBe(testProjectPath);
      }
    });

    it('should reject path traversal attempts in all prompt ID methods', async () => {
      const traversalIds = ['../../../etc/passwd', 'foo/bar', 'foo\\bar', '..\\secret'];

      for (const badId of traversalIds) {
        await expect(service.getCustomPrompt(testProjectPath, badId)).rejects.toThrow(
          'Invalid prompt ID'
        );
        await expect(
          service.updateCustomPrompt(testProjectPath, badId, { title: 'x' })
        ).rejects.toThrow('Invalid prompt ID');
        await expect(service.deleteCustomPrompt(testProjectPath, badId)).rejects.toThrow(
          'Invalid prompt ID'
        );
      }
    });
  });
});
