/**
 * CustomPromptDialog - Modal for creating and managing custom prompts
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Sparkles, Lightbulb, Undo2, Check, Dices, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIdeationStore } from '@/store/ideation-store';
import { useCustomPromptForm, type CustomPromptFormState } from '../hooks/use-custom-prompt-form';
import {
  CORE_TEMPLATE_FIELDS,
  ADDITIONAL_TEMPLATE_FIELDS,
  CATEGORY_OPTIONS,
  ENHANCE_SYSTEM_PROMPTS,
  SURPRISE_PROMPTS,
  PROMPT_MAX_LENGTH,
  TEMPLATE_FIELDS,
  type PromptMode,
} from '../constants';
import type { IdeaCategory } from '@automaker/types';

// ============================================================================
// Helpers
// ============================================================================

const EMPTY_SUGGESTIONS: string[] = [];

function getPromptQuality(text: string): {
  label: string;
  color: string;
  variant: 'destructive' | 'warning' | 'success' | 'info';
} {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const hasSpecifics =
    /\b(api|component|database|auth|endpoint|route|hook|service|modal|form|table|button|page|dashboard)\b/i.test(
      text
    );

  if (wordCount < 10) return { label: 'Weak', color: 'destructive', variant: 'destructive' };
  if (wordCount < 30 || (!hasSpecifics && wordCount < 50))
    return { label: 'Basic', color: 'warning', variant: 'warning' };
  if (wordCount >= 50 && hasSpecifics)
    return { label: 'Excellent', color: 'info', variant: 'info' };
  return { label: 'Good', color: 'success', variant: 'success' };
}

function PromptQualityIndicator({ text }: { text: string }) {
  if (!text.trim()) return null;
  const quality = getPromptQuality(text);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            quality.variant === 'destructive' && 'w-1/4 bg-destructive',
            quality.variant === 'warning' && 'w-2/4 bg-[var(--status-warning)]',
            quality.variant === 'success' && 'w-3/4 bg-[var(--status-success)]',
            quality.variant === 'info' && 'w-full bg-[var(--status-info)]'
          )}
        />
      </div>
      <Badge variant={quality.variant} size="sm">
        {quality.label}
      </Badge>
    </div>
  );
}

function SuggestionChips({
  fieldKey,
  currentValue,
  onValueChange,
}: {
  fieldKey: string;
  currentValue: string;
  onValueChange: (value: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const recentSuggestions = useIdeationStore(
    (s) => s.recentTemplateSuggestions[fieldKey] ?? EMPTY_SUGGESTIONS
  );
  const addRecentSuggestion = useIdeationStore((s) => s.addRecentSuggestion);

  const field = TEMPLATE_FIELDS.find((f) => f.key === fieldKey);
  if (!field?.suggestions) return null;

  // Merge recent first, then defaults, deduped
  const allSuggestions = [...new Set([...recentSuggestions, ...field.suggestions])];
  const displaySuggestions = showAll ? allSuggestions : allSuggestions.slice(0, 12);

  // Parse current comma-separated values
  const selectedValues = currentValue
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const isSelected = (suggestion: string) => selectedValues.includes(suggestion.toLowerCase());

  const toggleSuggestion = (suggestion: string) => {
    if (isSelected(suggestion)) {
      // Remove
      const newValues = selectedValues.filter((v) => v !== suggestion.toLowerCase());
      onValueChange(newValues.join(', '));
    } else {
      // Add
      const newValues = [...selectedValues, suggestion];
      onValueChange(newValues.join(', '));
      addRecentSuggestion(fieldKey, suggestion);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {displaySuggestions.map((suggestion) => (
          <Badge
            key={suggestion}
            variant={isSelected(suggestion) ? 'default' : 'outline'}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleSuggestion(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
      {allSuggestions.length > 12 && (
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show less' : `Show ${allSuggestions.length - 12} more`}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components (inline - only used here)
// ============================================================================

interface FormProps {
  formState: CustomPromptFormState;
  setFormState: React.Dispatch<React.SetStateAction<CustomPromptFormState>>;
  effectivePrompt: string;
}

function PromptModeSelector({ formState, setFormState, effectivePrompt }: FormProps) {
  const [debouncedPreview, setDebouncedPreview] = useState(effectivePrompt);
  const [showAdditionalContext, setShowAdditionalContext] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPreview(effectivePrompt), 300);
    return () => clearTimeout(timer);
  }, [effectivePrompt]);

  const hasAdditionalContent =
    !!formState.templateFields.context?.trim() || !!formState.templateFields.braindump?.trim();

  return (
    <Tabs
      value={formState.promptMode}
      onValueChange={(v) => {
        const mode = v as PromptMode;
        setFormState((prev) => ({ ...prev, promptMode: mode }));
        try {
          localStorage.setItem('ideation-custom-prompt-mode', mode);
        } catch {}
      }}
    >
      <TabsList className="w-full">
        <TabsTrigger value="freetext" className="flex-1">
          Free Text
        </TabsTrigger>
        <TabsTrigger value="template" className="flex-1">
          Template
        </TabsTrigger>
      </TabsList>

      <TabsContent value="freetext" className="mt-3 space-y-2">
        <Textarea
          value={formState.promptText}
          onChange={(e) => setFormState((prev) => ({ ...prev, promptText: e.target.value }))}
          placeholder="Describe what kind of ideas you want to generate..."
          rows={5}
          className="resize-y"
          maxLength={PROMPT_MAX_LENGTH}
        />
        <div className="flex items-center justify-between">
          <PromptQualityIndicator text={formState.promptText} />
          <span className="text-xs text-muted-foreground">
            {formState.promptText.length} / {PROMPT_MAX_LENGTH.toLocaleString()}
          </span>
        </div>
      </TabsContent>

      <TabsContent value="template" className="mt-3 space-y-3">
        {CORE_TEMPLATE_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1">
            <Label className="text-sm font-medium">{field.label}</Label>
            <Input
              value={formState.templateFields[field.key] || ''}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  templateFields: { ...prev.templateFields, [field.key]: e.target.value },
                }))
              }
              placeholder={field.placeholder}
            />
            <SuggestionChips
              fieldKey={field.key}
              currentValue={formState.templateFields[field.key] || ''}
              onValueChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  templateFields: { ...prev.templateFields, [field.key]: value },
                }))
              }
            />
          </div>
        ))}

        {/* Collapsible Additional Context section */}
        <div className="space-y-2">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowAdditionalContext(!showAdditionalContext)}
          >
            {showAdditionalContext ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            Additional Context
            {hasAdditionalContent && !showAdditionalContext && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
          {showAdditionalContext && (
            <div className="space-y-3 pl-1">
              {ADDITIONAL_TEMPLATE_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  <Textarea
                    value={formState.templateFields[field.key] || ''}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        templateFields: { ...prev.templateFields, [field.key]: e.target.value },
                      }))
                    }
                    placeholder={field.placeholder}
                    rows={3}
                    className="resize-y"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {debouncedPreview && (
          <div className="p-3 rounded-md bg-muted text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Preview: </span>
            <span className="whitespace-pre-wrap">{debouncedPreview}</span>
          </div>
        )}
        <PromptQualityIndicator text={effectivePrompt} />
      </TabsContent>
    </Tabs>
  );
}

function CategoryPicker({
  formState,
  setFormState,
}: Pick<FormProps, 'formState' | 'setFormState'>) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">Category (optional)</Label>
      <Select
        value={formState.category}
        onValueChange={(v) =>
          setFormState((prev) => ({ ...prev, category: v as IdeaCategory | '' }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category..." />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface EnhanceProps {
  showEnhanceComparison: boolean;
  enhancedPrompt: string | null;
  effectivePrompt: string;
  canEnhance: boolean;
  enhanceIsPending: boolean;
  enhanceError: Error | null;
  intensity: 'refine' | 'expand';
  onIntensityChange: (intensity: 'refine' | 'expand') => void;
  showSystemPrompt: boolean;
  customSystemPrompt: string;
  onToggleSystemPrompt: () => void;
  onSystemPromptChange: (value: string) => void;
  onEnhance: () => void;
  onAcceptOriginal: () => void;
  onAcceptEnhanced: () => void;
  onEnhancedPromptEdit: (value: string) => void;
}

function EnhancePromptSection({
  showEnhanceComparison,
  enhancedPrompt,
  effectivePrompt,
  canEnhance,
  enhanceIsPending,
  enhanceError,
  intensity,
  onIntensityChange,
  showSystemPrompt,
  customSystemPrompt,
  onToggleSystemPrompt,
  onSystemPromptChange,
  onEnhance,
  onAcceptOriginal,
  onAcceptEnhanced,
  onEnhancedPromptEdit,
}: EnhanceProps) {
  return (
    <>
      {!showEnhanceComparison && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEnhance} disabled={!canEnhance} className="gap-2">
              {enhanceIsPending ? <Spinner size="sm" /> : <Sparkles className="w-4 h-4" />}
              Enhance Prompt
            </Button>
            <div className="flex rounded-md border overflow-hidden">
              <button
                type="button"
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  intensity === 'refine'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                )}
                onClick={() => onIntensityChange('refine')}
              >
                Refine
              </button>
              <button
                type="button"
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  intensity === 'expand'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                )}
                onClick={() => onIntensityChange('expand')}
              >
                Expand
              </button>
            </div>
          </div>
          {enhanceIsPending && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                <Spinner size="sm" />
                <span className="text-sm text-muted-foreground">Enhancing your prompt...</span>
              </div>
              <div className="p-3 rounded-md bg-muted text-sm text-muted-foreground whitespace-pre-wrap">
                <span className="font-medium text-foreground">Sent: </span>
                {effectivePrompt}
              </div>
            </div>
          )}
          {enhanceError && (
            <p className="text-xs text-destructive">Failed to enhance: {enhanceError.message}</p>
          )}
          <div className="space-y-2">
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={onToggleSystemPrompt}
            >
              {showSystemPrompt ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              View system prompt
            </button>
            {showSystemPrompt && (
              <Textarea
                value={customSystemPrompt || ENHANCE_SYSTEM_PROMPTS[intensity]}
                onChange={(e) => onSystemPromptChange(e.target.value)}
                rows={6}
                className="text-xs font-mono resize-y"
                placeholder="System prompt for enhancement..."
              />
            )}
          </div>
        </div>
      )}

      {showEnhanceComparison && enhancedPrompt && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground uppercase">Your Prompt</div>
              <Button variant="outline" size="sm" onClick={onAcceptOriginal} className="gap-1">
                <Undo2 className="w-3 h-3" />
                Use Original
              </Button>
            </div>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">{effectivePrompt}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-primary uppercase">Enhanced Version</div>
              <Button size="sm" onClick={onAcceptEnhanced} className="gap-1">
                <Check className="w-3 h-3" />
                Use Enhanced
              </Button>
            </div>
            <Textarea
              value={enhancedPrompt}
              onChange={(e) => onEnhancedPromptEdit(e.target.value)}
              rows={8}
              className="resize-y border-primary/30 bg-primary/5"
            />
          </div>
        </div>
      )}
    </>
  );
}

function SaveForLaterSection({
  formState,
  setFormState,
}: Pick<FormProps, 'formState' | 'setFormState'>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id="save-prompt"
          checked={formState.saveForLater}
          onCheckedChange={(checked) =>
            setFormState((prev) => ({ ...prev, saveForLater: checked === true }))
          }
        />
        <Label htmlFor="save-prompt" className="text-sm cursor-pointer">
          Save for reuse
        </Label>
      </div>
      {formState.saveForLater && (
        <Input
          value={formState.saveTitle}
          onChange={(e) => setFormState((prev) => ({ ...prev, saveTitle: e.target.value }))}
          placeholder="Give this prompt a name..."
        />
      )}
    </div>
  );
}

// ============================================================================
// Main Dialog
// ============================================================================

export function CustomPromptDialog() {
  const { customPromptDialogOpen } = useIdeationStore();
  const form = useCustomPromptForm();

  return (
    <Dialog
      open={customPromptDialogOpen}
      onOpenChange={(open) => {
        if (!open) form.handleClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Custom Prompt
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto gap-1 text-muted-foreground"
              onClick={() => {
                const random =
                  SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
                form.setFormState((prev) => ({
                  ...prev,
                  promptMode: 'freetext' as PromptMode,
                  promptText: random,
                }));
              }}
            >
              <Dices className="w-4 h-4" />
              Surprise me
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <PromptModeSelector
            formState={form.formState}
            setFormState={form.setFormState}
            effectivePrompt={form.effectivePrompt}
          />
          <CategoryPicker formState={form.formState} setFormState={form.setFormState} />
          <EnhancePromptSection
            showEnhanceComparison={form.formState.showEnhanceComparison}
            enhancedPrompt={form.formState.enhancedPrompt}
            effectivePrompt={form.effectivePrompt}
            canEnhance={form.canEnhance}
            enhanceIsPending={form.enhanceMutation.isPending}
            enhanceError={form.enhanceMutation.error}
            intensity={form.formState.intensity}
            onIntensityChange={(intensity) => form.setFormState((prev) => ({ ...prev, intensity }))}
            showSystemPrompt={form.formState.showSystemPrompt}
            customSystemPrompt={form.formState.customSystemPrompt}
            onToggleSystemPrompt={() =>
              form.setFormState((prev) => ({ ...prev, showSystemPrompt: !prev.showSystemPrompt }))
            }
            onSystemPromptChange={(value) =>
              form.setFormState((prev) => ({ ...prev, customSystemPrompt: value }))
            }
            onEnhance={form.handleEnhance}
            onAcceptOriginal={form.handleAcceptOriginal}
            onAcceptEnhanced={form.handleAcceptEnhanced}
            onEnhancedPromptEdit={(value) =>
              form.setFormState((prev) => ({ ...prev, enhancedPrompt: value }))
            }
          />
          <SaveForLaterSection formState={form.formState} setFormState={form.setFormState} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={form.handleClose}>
            Cancel
          </Button>
          <Button
            onClick={form.handleGenerate}
            disabled={!form.canGenerate || form.isSubmitting}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            Generate Ideas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
