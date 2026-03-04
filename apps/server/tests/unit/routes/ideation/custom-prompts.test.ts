import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import {
  createCustomPromptsListHandler,
  createCustomPromptsSaveHandler,
  createCustomPromptsUpdateHandler,
  createCustomPromptsDeleteHandler,
} from '@/routes/ideation/routes/custom-prompts.js';
import type { IdeationService } from '@/services/ideation-service.js';

// Mock logger
vi.mock('@automaker/utils', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

function createMockExpressContext(body: Record<string, unknown> = {}) {
  const req = { body } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return { req, res };
}

describe('Custom Prompts Route Handlers', () => {
  let mockIdeationService: IdeationService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIdeationService = {
      listCustomPrompts: vi.fn(),
      saveCustomPrompt: vi.fn(),
      updateCustomPrompt: vi.fn(),
      deleteCustomPrompt: vi.fn(),
    } as unknown as IdeationService;
  });

  // ============================================================================
  // List Handler
  // ============================================================================

  describe('createCustomPromptsListHandler', () => {
    it('should return 400 when projectPath is missing', async () => {
      const handler = createCustomPromptsListHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({});

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'projectPath is required' })
      );
    });

    it('should return prompts on success', async () => {
      const prompts = [{ id: 'custom-1', title: 'Test' }];
      vi.mocked(mockIdeationService.listCustomPrompts).mockResolvedValue(prompts as any);
      const handler = createCustomPromptsListHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({ projectPath: '/test' });

      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, prompts });
    });
  });

  // ============================================================================
  // Save Handler
  // ============================================================================

  describe('createCustomPromptsSaveHandler', () => {
    it('should return 400 when title or prompt is missing', async () => {
      const handler = createCustomPromptsSaveHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({ projectPath: '/test' });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'title and prompt are required' })
      );
    });

    it('should return 400 when title exceeds 500 chars', async () => {
      const handler = createCustomPromptsSaveHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({
        projectPath: '/test',
        title: 'a'.repeat(501),
        prompt: 'valid prompt',
      });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Title must be 500 characters or less' })
      );
    });

    it('should return 400 when prompt exceeds 10000 chars', async () => {
      const handler = createCustomPromptsSaveHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({
        projectPath: '/test',
        title: 'Valid Title',
        prompt: 'a'.repeat(10001),
      });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Prompt must be 10000 characters or less' })
      );
    });

    it('should save and return prompt on success', async () => {
      const saved = { id: 'custom-1', title: 'Test', prompt: 'test prompt' };
      vi.mocked(mockIdeationService.saveCustomPrompt).mockResolvedValue(saved as any);
      const handler = createCustomPromptsSaveHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({
        projectPath: '/test',
        title: 'Test',
        prompt: 'test prompt',
      });

      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, prompt: saved });
    });
  });

  // ============================================================================
  // Update Handler
  // ============================================================================

  describe('createCustomPromptsUpdateHandler', () => {
    it('should return 400 when projectPath or promptId is missing', async () => {
      const handler = createCustomPromptsUpdateHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({ projectPath: '/test' });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when prompt not found', async () => {
      vi.mocked(mockIdeationService.updateCustomPrompt).mockResolvedValue(null);
      const handler = createCustomPromptsUpdateHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({
        projectPath: '/test',
        promptId: 'custom-missing',
        updates: { title: 'x' },
      });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Custom prompt not found' })
      );
    });

    it('should return updated prompt on success', async () => {
      const updated = { id: 'custom-1', title: 'Updated' };
      vi.mocked(mockIdeationService.updateCustomPrompt).mockResolvedValue(updated as any);
      const handler = createCustomPromptsUpdateHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({
        projectPath: '/test',
        promptId: 'custom-1',
        updates: { title: 'Updated' },
      });

      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, prompt: updated });
    });
  });

  // ============================================================================
  // Delete Handler
  // ============================================================================

  describe('createCustomPromptsDeleteHandler', () => {
    it('should return 400 when projectPath or promptId is missing', async () => {
      const handler = createCustomPromptsDeleteHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({ projectPath: '/test' });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when prompt not found', async () => {
      vi.mocked(mockIdeationService.deleteCustomPrompt).mockResolvedValue(false);
      const handler = createCustomPromptsDeleteHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({
        projectPath: '/test',
        promptId: 'custom-missing',
      });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return success when deleted', async () => {
      vi.mocked(mockIdeationService.deleteCustomPrompt).mockResolvedValue(true);
      const handler = createCustomPromptsDeleteHandler(mockIdeationService);
      const { req, res } = createMockExpressContext({
        projectPath: '/test',
        promptId: 'custom-1',
      });

      await handler(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
