/**
 * Ideation Mutation Hooks
 *
 * React Query mutations for ideation operations like generating suggestions,
 * enhancing prompts, and managing custom prompts.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getElectronAPI } from '@/lib/electron';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';
import type {
  IdeaCategory,
  AnalysisSuggestion,
  CustomIdeationPrompt,
  EnhancePromptOptions,
} from '@automaker/types';
import { useIdeationStore } from '@/store/ideation-store';

/**
 * Input for generating ideation suggestions
 */
interface GenerateSuggestionsInput {
  promptId?: string;
  customPromptText?: string;
  category: IdeaCategory;
  /** Job ID for tracking generation progress - used to update job status on completion */
  jobId: string;
  /** Prompt title for toast notifications */
  promptTitle: string;
}

/**
 * Result from generating suggestions
 */
interface GenerateSuggestionsResult {
  suggestions: AnalysisSuggestion[];
  promptId?: string;
  category: IdeaCategory;
  /** Job ID passed through for onSuccess handler */
  jobId: string;
  /** Prompt title passed through for toast notifications */
  promptTitle: string;
}

/**
 * Generate ideation suggestions based on a prompt or custom text
 */
export function useGenerateIdeationSuggestions(projectPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GenerateSuggestionsInput): Promise<GenerateSuggestionsResult> => {
      const { promptId, customPromptText, category, jobId, promptTitle } = input;

      const api = getElectronAPI();
      if (!api.ideation?.generateSuggestions) {
        throw new Error('Ideation API not available');
      }

      // Get context sources from store
      const contextSources = useIdeationStore.getState().getContextSources(projectPath);

      const result = await api.ideation.generateSuggestions(
        projectPath,
        promptId || null,
        category,
        undefined, // count - use default
        contextSources,
        customPromptText
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate suggestions');
      }

      return {
        suggestions: result.suggestions ?? [],
        promptId,
        category,
        jobId,
        promptTitle,
      };
    },
    onSuccess: (data, variables) => {
      // Update job status in Zustand store - this runs even if the component unmounts
      // Using getState() to access store directly without hooks (safe in callbacks)
      const updateJobStatus = useIdeationStore.getState().updateJobStatus;
      updateJobStatus(data.jobId, 'ready', data.suggestions);

      // Show success toast
      toast.success(`Generated ${data.suggestions.length} ideas for "${data.promptTitle}"`, {
        duration: 10000,
      });

      // Invalidate ideation ideas cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.ideation.ideas(projectPath),
      });

      // Invalidate prompt history when custom prompt was used
      if (data.promptId?.startsWith('custom-') || variables.customPromptText) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.ideation.promptHistory(projectPath),
        });
      }
    },
    onError: (error, variables) => {
      // Update job status to error - this runs even if the component unmounts
      const updateJobStatus = useIdeationStore.getState().updateJobStatus;
      updateJobStatus(variables.jobId, 'error', undefined, error.message);

      // Show error toast
      toast.error(`Failed to generate ideas: ${error.message}`);
    },
  });
}

/**
 * Enhance a custom prompt using AI
 */
export function useEnhancePrompt(projectPath: string) {
  return useMutation({
    mutationFn: async (input: Omit<EnhancePromptOptions, 'projectPath' | 'contextSources'>) => {
      const api = getElectronAPI();
      if (!api.ideation?.enhancePrompt) {
        throw new Error('Ideation API not available');
      }

      // Get context sources from store
      const contextSources = useIdeationStore.getState().getContextSources(projectPath);

      const result = await api.ideation.enhancePrompt({
        projectPath,
        contextSources,
        ...input,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to enhance prompt');
      }

      return { original: result.original!, enhanced: result.enhanced! };
    },
    onError: (error) => {
      toast.error(`Failed to enhance prompt: ${error.message}`);
    },
  });
}

/**
 * Save a custom prompt for reuse
 */
export function useSaveCustomPrompt(projectPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      prompt: string;
      category?: IdeaCategory;
      isTemplate?: boolean;
      templateFields?: string[];
    }): Promise<CustomIdeationPrompt> => {
      const api = getElectronAPI();
      if (!api.ideation?.saveCustomPrompt) {
        throw new Error('Ideation API not available');
      }

      const result = await api.ideation.saveCustomPrompt(projectPath, data);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save custom prompt');
      }

      return result.prompt!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ideation.customPrompts(projectPath),
      });
      toast.success('Custom prompt saved');
    },
    onError: (error) => {
      toast.error(`Failed to save custom prompt: ${error.message}`);
    },
  });
}

/**
 * Update a saved custom prompt
 */
export function useUpdateCustomPrompt(projectPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      promptId: string;
      updates: Partial<
        Pick<
          CustomIdeationPrompt,
          'title' | 'prompt' | 'category' | 'isTemplate' | 'templateFields'
        >
      >;
    }): Promise<CustomIdeationPrompt> => {
      const api = getElectronAPI();
      if (!api.ideation?.updateCustomPrompt) {
        throw new Error('Ideation API not available');
      }

      const result = await api.ideation.updateCustomPrompt(
        projectPath,
        input.promptId,
        input.updates
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update custom prompt');
      }

      return result.prompt!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ideation.customPrompts(projectPath),
      });
      toast.success('Custom prompt updated');
    },
    onError: (error) => {
      toast.error(`Failed to update custom prompt: ${error.message}`);
    },
  });
}

/**
 * Delete a saved custom prompt
 */
export function useDeleteCustomPrompt(projectPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptId: string) => {
      const api = getElectronAPI();
      if (!api.ideation?.deleteCustomPrompt) {
        throw new Error('Ideation API not available');
      }

      const result = await api.ideation.deleteCustomPrompt(projectPath, promptId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete custom prompt');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ideation.customPrompts(projectPath),
      });
      toast.success('Custom prompt deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete custom prompt: ${error.message}`);
    },
  });
}
