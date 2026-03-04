import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useIdeationStore } from '@/store/ideation-store';
import { useAppStore } from '@/store/app-store';
import {
  useGenerateIdeationSuggestions,
  useEnhancePrompt,
  useSaveCustomPrompt,
} from '@/hooks/mutations';
import type { IdeaCategory, IdeationPrompt, CustomIdeationPrompt } from '@automaker/types';
import { assembleTemplatePrompt, type PromptMode } from '../constants';

export interface CustomPromptFormState {
  promptMode: PromptMode;
  promptText: string;
  templateFields: Record<string, string>;
  category: IdeaCategory | '';
  saveForLater: boolean;
  saveTitle: string;
  enhancedPrompt: string | null;
  showEnhanceComparison: boolean;
  intensity: 'refine' | 'expand';
  showSystemPrompt: boolean;
  customSystemPrompt: string;
}

const PROMPT_MODE_STORAGE_KEY = 'ideation-custom-prompt-mode';

function getSavedPromptMode(): PromptMode {
  try {
    const saved = localStorage.getItem(PROMPT_MODE_STORAGE_KEY);
    if (saved === 'freetext' || saved === 'template') return saved;
  } catch {}
  return 'freetext';
}

const initialFormState: CustomPromptFormState = {
  promptMode: getSavedPromptMode(),
  promptText: '',
  templateFields: { topic: '', focus: '', audience: '', context: '', braindump: '' },
  category: '',
  saveForLater: false,
  saveTitle: '',
  enhancedPrompt: null,
  showEnhanceComparison: false,
  intensity: 'refine' as const,
  showSystemPrompt: false,
  customSystemPrompt: '',
};

export function useCustomPromptForm() {
  const currentProject = useAppStore((s) => s.currentProject);
  const {
    customPromptDialogOpen,
    customPromptDialogCategory,
    customPromptDialogPrefill,
    closeCustomPromptDialog,
    addGenerationJob,
    setMode,
  } = useIdeationStore();

  const projectPath = currentProject?.path ?? '';

  const generateMutation = useGenerateIdeationSuggestions(projectPath);
  const enhanceMutation = useEnhancePrompt(projectPath);
  const saveMutation = useSaveCustomPrompt(projectPath);

  const [formState, setFormState] = useState<CustomPromptFormState>(initialFormState);

  const effectivePrompt =
    formState.promptMode === 'template'
      ? assembleTemplatePrompt(formState.templateFields)
      : formState.promptText;

  const activePrompt = formState.enhancedPrompt ?? effectivePrompt;
  const resolvedCategory: IdeaCategory = (formState.category as IdeaCategory) || 'feature';
  const canGenerate = activePrompt.trim().length > 0;
  const canEnhance =
    effectivePrompt.trim().length > 0 &&
    !enhanceMutation.isPending &&
    (formState.promptMode !== 'template' || !!formState.templateFields.topic?.trim());
  const isSubmitting =
    saveMutation.isPending || generateMutation.isPending || enhanceMutation.isPending;

  const resetForm = useCallback(
    (category?: IdeaCategory | null, prefill?: CustomIdeationPrompt | null) => {
      if (prefill) {
        setFormState({
          promptMode: prefill.isTemplate ? 'template' : 'freetext',
          promptText: prefill.isTemplate ? '' : prefill.prompt,
          templateFields: { topic: '', focus: '', audience: '', context: '', braindump: '' },
          category: prefill.category ?? '',
          saveForLater: true,
          saveTitle: prefill.title,
          enhancedPrompt: null,
          showEnhanceComparison: false,
          intensity: 'refine' as const,
          showSystemPrompt: false,
          customSystemPrompt: '',
        });
      } else {
        setFormState({
          ...initialFormState,
          category: category ?? '',
        });
      }
    },
    []
  );

  // Reset form when dialog opens
  useEffect(() => {
    if (customPromptDialogOpen) {
      resetForm(customPromptDialogCategory, customPromptDialogPrefill);
    }
  }, [customPromptDialogOpen, customPromptDialogCategory, customPromptDialogPrefill, resetForm]);

  const handleEnhance = useCallback(() => {
    if (!canEnhance) return;

    enhanceMutation.mutate(
      {
        promptText: effectivePrompt,
        category: resolvedCategory,
        intensity: formState.intensity,
        customSystemPrompt: formState.customSystemPrompt || undefined,
      },
      {
        onSuccess: (data) => {
          setFormState((prev) => ({
            ...prev,
            enhancedPrompt: data.enhanced,
            showEnhanceComparison: true,
          }));
        },
      }
    );
  }, [
    canEnhance,
    effectivePrompt,
    resolvedCategory,
    formState.intensity,
    formState.customSystemPrompt,
    enhanceMutation,
  ]);

  const handleAcceptOriginal = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      enhancedPrompt: null,
      showEnhanceComparison: false,
    }));
  }, []);

  const handleAcceptEnhanced = useCallback(() => {
    setFormState((prev) => {
      if (prev.enhancedPrompt) {
        return {
          ...prev,
          // Switch to freetext mode since the enhanced text is a fully formed prompt
          promptMode: 'freetext' as PromptMode,
          promptText: prev.enhancedPrompt,
          enhancedPrompt: null,
          showEnhanceComparison: false,
        };
      }
      return { ...prev, enhancedPrompt: null, showEnhanceComparison: false };
    });
  }, []);

  const handleClose = useCallback(() => {
    closeCustomPromptDialog();
  }, [closeCustomPromptDialog]);

  const handleGenerate = useCallback(() => {
    if (!canGenerate || !projectPath || isSubmitting) return;

    const finalPrompt = activePrompt;

    // Save if requested
    if (formState.saveForLater && formState.saveTitle.trim()) {
      saveMutation.mutate({
        title: formState.saveTitle.trim(),
        prompt: finalPrompt,
        category: formState.category ? (formState.category as IdeaCategory) : undefined,
        isTemplate: formState.promptMode === 'template',
        templateFields:
          formState.promptMode === 'template' ? Object.keys(formState.templateFields) : undefined,
      });
    }

    // Create a pseudo IdeationPrompt for the generation job
    const customIdeationPrompt: IdeationPrompt = {
      id: `custom-adhoc-${Date.now()}`,
      category: resolvedCategory,
      title: formState.saveTitle.trim() || 'Custom Prompt',
      description: finalPrompt.slice(0, 100),
      prompt: finalPrompt,
      isCustom: true,
    };

    const jobId = addGenerationJob(projectPath, customIdeationPrompt);

    toast.info('Generating ideas from custom prompt...');
    setMode('dashboard');
    handleClose();

    generateMutation.mutate({
      customPromptText: finalPrompt,
      category: resolvedCategory,
      jobId,
      promptTitle: customIdeationPrompt.title,
    });
  }, [
    canGenerate,
    projectPath,
    isSubmitting,
    activePrompt,
    formState,
    saveMutation,
    resolvedCategory,
    addGenerationJob,
    setMode,
    handleClose,
    generateMutation,
  ]);

  return {
    formState,
    setFormState,
    effectivePrompt,
    activePrompt,
    resolvedCategory,
    canGenerate,
    canEnhance,
    isSubmitting,
    enhanceMutation,
    handleEnhance,
    handleAcceptOriginal,
    handleAcceptEnhanced,
    handleGenerate,
    handleClose,
    resetForm,
  };
}
