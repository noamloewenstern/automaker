import type { Request, Response } from 'express';
import type { IdeationService } from '../../../services/ideation-service.js';
import { getErrorMessage, logError } from '../common.js';

export function createPromptHistoryHandler(ideationService: IdeationService) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath } = req.body;
      if (!projectPath) {
        res.status(400).json({ success: false, error: 'projectPath is required' });
        return;
      }

      const history = await ideationService.getPromptHistory(projectPath);
      res.json({ success: true, history });
    } catch (error) {
      logError(error, 'Failed to get prompt history');
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
