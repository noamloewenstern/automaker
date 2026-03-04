import type { Request, Response } from 'express';
import type { IdeationService } from '../../../services/ideation-service.js';
import { createLogger } from '@automaker/utils';
import { getErrorMessage, logError } from '../common.js';

const logger = createLogger('ideation:enhance-prompt');

export function createEnhancePromptHandler(ideationService: IdeationService) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, promptText, category, intensity, contextSources, customSystemPrompt } =
        req.body;

      if (!projectPath) {
        res.status(400).json({ success: false, error: 'projectPath is required' });
        return;
      }

      if (!promptText) {
        res.status(400).json({ success: false, error: 'promptText is required' });
        return;
      }

      logger.info('Enhancing prompt for project:', projectPath);

      const result = await ideationService.enhancePrompt(
        projectPath,
        promptText,
        category,
        intensity,
        contextSources,
        customSystemPrompt
      );

      res.json({ success: true, ...result });
    } catch (error) {
      logError(error, 'Failed to enhance prompt');
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
