/**
 * Common utilities for ideation routes
 */

import { createLogger } from '@automaker/utils';
import { getErrorMessage as getErrorMessageShared, createLogError } from '../common.js';

const logger = createLogger('Ideation');

// Re-export shared utilities
export { getErrorMessageShared as getErrorMessage };
export const logError = createLogError(logger);

// ============================================================================
// Running state tracking for ideation operations (same pattern as backlog-plan/spec)
// ============================================================================

export type IdeationOperationType = 'suggestions' | 'analysis';

interface RunningIdeationOperation {
  type: IdeationOperationType;
  projectPath: string;
  startedAt: string;
  description: string;
}

const runningOperations = new Map<string, RunningIdeationOperation>();

function operationKey(projectPath: string, type: IdeationOperationType): string {
  return `${projectPath}:${type}`;
}

export function setIdeationRunning(
  projectPath: string,
  type: IdeationOperationType,
  description: string
): void {
  const key = operationKey(projectPath, type);
  runningOperations.set(key, {
    type,
    projectPath,
    startedAt: new Date().toISOString(),
    description,
  });
}

export function clearIdeationRunning(projectPath: string, type: IdeationOperationType): void {
  const key = operationKey(projectPath, type);
  runningOperations.delete(key);
}

export function getAllRunningIdeation(): Array<{
  projectPath: string;
  type: IdeationOperationType;
  startedAt: string;
  description: string;
}> {
  return Array.from(runningOperations.values());
}
