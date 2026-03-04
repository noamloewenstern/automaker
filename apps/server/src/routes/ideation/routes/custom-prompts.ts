import type { Request, Response } from 'express';
import type { IdeationService } from '../../../services/ideation-service.js';
import { createLogger } from '@automaker/utils';
import { getErrorMessage, logError } from '../common.js';

const logger = createLogger('ideation:custom-prompts');

export function createCustomPromptsListHandler(ideationService: IdeationService) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath } = req.body;
      if (!projectPath) {
        res.status(400).json({ success: false, error: 'projectPath is required' });
        return;
      }

      const prompts = await ideationService.listCustomPrompts(projectPath);
      res.json({ success: true, prompts });
    } catch (error) {
      logError(error, 'Failed to list custom prompts');
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}

export function createCustomPromptsSaveHandler(ideationService: IdeationService) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, title, prompt, category, isTemplate, templateFields } = req.body;
      if (!projectPath) {
        res.status(400).json({ success: false, error: 'projectPath is required' });
        return;
      }
      if (!title || !prompt) {
        res.status(400).json({ success: false, error: 'title and prompt are required' });
        return;
      }
      if (title.length > 500) {
        res.status(400).json({ success: false, error: 'Title must be 500 characters or less' });
        return;
      }
      if (prompt.length > 10000) {
        res.status(400).json({ success: false, error: 'Prompt must be 10000 characters or less' });
        return;
      }

      logger.info('Saving custom prompt:', title);
      const saved = await ideationService.saveCustomPrompt(projectPath, {
        title,
        prompt,
        category,
        isTemplate,
        templateFields,
      });
      res.json({ success: true, prompt: saved });
    } catch (error) {
      logError(error, 'Failed to save custom prompt');
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}

export function createCustomPromptsUpdateHandler(ideationService: IdeationService) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, promptId, updates } = req.body;
      if (!projectPath || !promptId) {
        res.status(400).json({ success: false, error: 'projectPath and promptId are required' });
        return;
      }

      const updated = await ideationService.updateCustomPrompt(projectPath, promptId, updates);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Custom prompt not found' });
        return;
      }

      res.json({ success: true, prompt: updated });
    } catch (error) {
      logError(error, 'Failed to update custom prompt');
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}

export function createCustomPromptsDeleteHandler(ideationService: IdeationService) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, promptId } = req.body;
      if (!projectPath || !promptId) {
        res.status(400).json({ success: false, error: 'projectPath and promptId are required' });
        return;
      }

      const deleted = await ideationService.deleteCustomPrompt(projectPath, promptId);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Custom prompt not found' });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      logError(error, 'Failed to delete custom prompt');
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
