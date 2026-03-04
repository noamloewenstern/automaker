import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { createSuggestionsGenerateHandler } from '@/routes/ideation/routes/suggestions-generate.js';
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

describe('Suggestions Generate Route Handler', () => {
  let mockIdeationService: IdeationService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIdeationService = {
      generateSuggestions: vi.fn(),
    } as unknown as IdeationService;
  });

  it('should return 400 when projectPath is missing', async () => {
    const handler = createSuggestionsGenerateHandler(mockIdeationService);
    const { req, res } = createMockExpressContext({});

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'projectPath is required' })
    );
  });

  it('should return 400 when neither promptId nor customPromptText provided', async () => {
    const handler = createSuggestionsGenerateHandler(mockIdeationService);
    const { req, res } = createMockExpressContext({ projectPath: '/test' });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'promptId or customPromptText is required' })
    );
  });

  it('should return 400 when customPromptText exceeds 10000 chars', async () => {
    const handler = createSuggestionsGenerateHandler(mockIdeationService);
    const { req, res } = createMockExpressContext({
      projectPath: '/test',
      customPromptText: 'a'.repeat(10001),
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Custom prompt text must be 10000 characters or less',
      })
    );
  });

  it('should accept customPromptText and generate suggestions', async () => {
    const suggestions = [{ id: 's1', title: 'Idea 1', category: 'feature' }];
    vi.mocked(mockIdeationService.generateSuggestions).mockResolvedValue(suggestions as any);
    const handler = createSuggestionsGenerateHandler(mockIdeationService);
    const { req, res } = createMockExpressContext({
      projectPath: '/test',
      customPromptText: 'Generate ideas about auth',
      category: 'feature',
    });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, suggestions });
    expect(mockIdeationService.generateSuggestions).toHaveBeenCalledWith(
      '/test',
      null,
      'feature',
      10,
      undefined,
      'Generate ideas about auth'
    );
  });

  it('should accept promptId and generate suggestions', async () => {
    const suggestions = [{ id: 's1', title: 'Idea 1', category: 'feature' }];
    vi.mocked(mockIdeationService.generateSuggestions).mockResolvedValue(suggestions as any);
    const handler = createSuggestionsGenerateHandler(mockIdeationService);
    const { req, res } = createMockExpressContext({
      projectPath: '/test',
      promptId: 'custom-123',
      category: 'technical',
    });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, suggestions });
    expect(mockIdeationService.generateSuggestions).toHaveBeenCalledWith(
      '/test',
      'custom-123',
      'technical',
      10,
      undefined,
      undefined
    );
  });

  it('should default category to feature when not provided', async () => {
    vi.mocked(mockIdeationService.generateSuggestions).mockResolvedValue([]);
    const handler = createSuggestionsGenerateHandler(mockIdeationService);
    const { req, res } = createMockExpressContext({
      projectPath: '/test',
      customPromptText: 'test',
    });

    await handler(req, res);

    expect(mockIdeationService.generateSuggestions).toHaveBeenCalledWith(
      '/test',
      null,
      'feature',
      10,
      undefined,
      'test'
    );
  });

  it('should clamp count between 1 and 20', async () => {
    vi.mocked(mockIdeationService.generateSuggestions).mockResolvedValue([]);
    const handler = createSuggestionsGenerateHandler(mockIdeationService);

    // Count > 20 clamped to 20
    const { req: req1, res: res1 } = createMockExpressContext({
      projectPath: '/test',
      promptId: 'p1',
      count: 50,
    });
    await handler(req1, res1);
    expect(mockIdeationService.generateSuggestions).toHaveBeenCalledWith(
      '/test',
      'p1',
      'feature',
      20,
      undefined,
      undefined
    );

    // Count < 1 clamped to 1
    const { req: req2, res: res2 } = createMockExpressContext({
      projectPath: '/test',
      promptId: 'p1',
      count: -5,
    });
    await handler(req2, res2);
    expect(mockIdeationService.generateSuggestions).toHaveBeenCalledWith(
      '/test',
      'p1',
      'feature',
      1,
      undefined,
      undefined
    );
  });
});
