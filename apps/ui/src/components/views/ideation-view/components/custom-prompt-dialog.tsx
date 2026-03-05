/**
 * CustomPromptDialog - Modal for creating and managing custom prompts
 */

import { useState, useEffect, useCallback } from 'react';
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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { Markdown } from '@/components/ui/markdown';
import {
  Sparkles,
  Lightbulb,
  Undo2,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Copy,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIdeationStore } from '@/store/ideation-store';
import { ModelOverrideTrigger, type UseModelOverrideResult } from '@/components/shared';
import { useCustomPromptForm, type CustomPromptFormState } from '../hooks/use-custom-prompt-form';
import { TemplateFieldRenderer } from './template-field-renderer';
import {
  TEMPLATE_CATEGORIES,
  CATEGORY_OPTIONS,
  ENHANCE_SYSTEM_PROMPTS,
  PROMPT_MAX_LENGTH,
  PROMPT_QUALITY_DIMENSIONS,
  PROMPT_PATTERNS,
  type PromptMode,
} from '../constants';
import {
  ENHANCEMENT_MODE_LABELS,
  REWRITE_MODES,
  ADDITIVE_MODES,
} from '@/components/shared/enhancement-constants';
import type { IdeaCategory, EnhancePromptIntensity, EnhancementMode } from '@automaker/types';

// ============================================================================
// Helpers
// ============================================================================

const PREVIEW_MODE_KEY = 'ideation-prompt-preview-mode';

function getPreviewPreference(): boolean {
  try {
    return localStorage.getItem(PREVIEW_MODE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function setPreviewPreference(preview: boolean) {
  try {
    localStorage.setItem(PREVIEW_MODE_KEY, String(preview));
  } catch {}
}

// ============================================================================
// PromptViewer - Reusable prompt display with Raw/Preview, Copy, Expand
// ============================================================================

interface PromptViewerProps {
  content: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  previewMode: boolean;
  onPreviewModeChange: (preview: boolean) => void;
}

function PromptViewer({
  content,
  editable,
  onChange,
  className,
  previewMode,
  onPreviewModeChange,
}: PromptViewerProps) {
  const [copied, setCopied] = useState(false);
  const [largeViewOpen, setLargeViewOpen] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [content]);

  return (
    <>
      <div className={cn('space-y-1.5', className)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-md border overflow-hidden">
            <button
              type="button"
              className={cn(
                'px-2.5 py-1 text-xs font-medium transition-colors',
                !previewMode ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
              )}
              onClick={() => onPreviewModeChange(false)}
            >
              Raw
            </button>
            <button
              type="button"
              className={cn(
                'px-2.5 py-1 text-xs font-medium transition-colors',
                previewMode ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
              )}
              onClick={() => onPreviewModeChange(true)}
            >
              Preview
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setLargeViewOpen(true)}
              title="Expand to full view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {previewMode ? (
          <div className="max-h-[200px] overflow-y-auto p-3 rounded-md border bg-muted/30 text-sm prose-sm">
            <Markdown>{content}</Markdown>
          </div>
        ) : editable && onChange ? (
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            className="resize-y border-primary/30 bg-primary/5"
          />
        ) : (
          <div className="max-h-[200px] overflow-y-auto p-3 rounded-md border bg-muted/50 text-sm whitespace-pre-wrap">
            {content}
          </div>
        )}
      </div>
      <PromptLargeViewDialog
        open={largeViewOpen}
        onOpenChange={setLargeViewOpen}
        content={content}
        previewMode={previewMode}
        onPreviewModeChange={onPreviewModeChange}
      />
    </>
  );
}

function PromptLargeViewDialog({
  open,
  onOpenChange,
  content,
  previewMode,
  onPreviewModeChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  previewMode: boolean;
  onPreviewModeChange: (preview: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [content]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        noDefaultMaxWidth
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Prompt Preview</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex rounded-md border overflow-hidden">
            <button
              type="button"
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                !previewMode ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
              )}
              onClick={() => onPreviewModeChange(false)}
            >
              Raw
            </button>
            <button
              type="button"
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                previewMode ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
              )}
              onClick={() => onPreviewModeChange(true)}
            >
              Preview
            </button>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCopy}>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 border rounded-md">
          {previewMode ? (
            <Markdown>{content}</Markdown>
          ) : (
            <pre className="whitespace-pre-wrap text-sm">{content}</pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PromptQualityChecklist({
  text,
  onInsertSnippet,
}: {
  text: string;
  onInsertSnippet?: (snippet: string) => void;
}) {
  if (!text.trim()) return null;

  const results = PROMPT_QUALITY_DIMENSIONS.map((dim) => ({
    ...dim,
    passed: dim.check(text),
  }));
  const passCount = results.filter((r) => r.passed).length;
  const total = results.length;
  const ratio = passCount / total;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              ratio <= 0.25 && 'bg-destructive',
              ratio > 0.25 && ratio <= 0.5 && 'bg-[var(--status-warning)]',
              ratio > 0.5 && ratio < 1 && 'bg-[var(--status-success)]',
              ratio === 1 && 'bg-[var(--status-info)]'
            )}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <Badge
          variant={
            ratio <= 0.25
              ? 'destructive'
              : ratio <= 0.5
                ? 'warning'
                : ratio < 1
                  ? 'success'
                  : 'info'
          }
          size="sm"
        >
          {passCount}/{total}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {results.map((dim) => (
          <Badge
            key={dim.key}
            variant={dim.passed ? 'default' : 'outline'}
            className={cn(
              'text-xs transition-opacity',
              !dim.passed &&
                onInsertSnippet &&
                dim.insertSnippet &&
                'cursor-pointer hover:opacity-80'
            )}
            title={dim.passed ? dim.label : dim.tip}
            onClick={() => {
              if (!dim.passed && onInsertSnippet && dim.insertSnippet) {
                onInsertSnippet(dim.insertSnippet);
              }
            }}
          >
            {dim.passed ? (
              <>
                <Check className="w-3 h-3 mr-0.5" />
                {dim.label}
              </>
            ) : (
              dim.label
            )}
          </Badge>
        ))}
      </div>
      {results.some((r) => !r.passed) && (
        <p className="text-xs text-muted-foreground">{results.find((r) => !r.passed)?.tip}</p>
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

const SECTIONS_EXPANDED_KEY = 'ideation-template-sections-expanded';
const DEFAULT_EXPANDED = ['who-and-why'];

function getSavedExpandedSections(): string[] {
  try {
    const saved = localStorage.getItem(SECTIONS_EXPANDED_KEY);
    if (saved) return JSON.parse(saved) as string[];
  } catch {}
  return DEFAULT_EXPANDED;
}

function saveExpandedSections(sections: string[]) {
  try {
    localStorage.setItem(SECTIONS_EXPANDED_KEY, JSON.stringify(sections));
  } catch {}
}

function categoryHasContent(categoryId: string, fields: Record<string, string>): boolean {
  const cat = TEMPLATE_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return false;
  return cat.fields.some((f) => fields[f.key]?.trim());
}

function PromptModeSelector({ formState, setFormState, effectivePrompt }: FormProps) {
  const [debouncedPreview, setDebouncedPreview] = useState(effectivePrompt);
  const [expandedSections, setExpandedSections] = useState<string[]>(getSavedExpandedSections);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPreview(effectivePrompt), 300);
    return () => clearTimeout(timer);
  }, [effectivePrompt]);

  const handleAccordionChange = (value: string | string[]) => {
    const sections = Array.isArray(value) ? value : [value].filter(Boolean);
    setExpandedSections(sections);
    saveExpandedSections(sections);
  };

  const coreCategory = TEMPLATE_CATEGORIES.find((c) => c.alwaysVisible);
  const accordionCategories = TEMPLATE_CATEGORIES.filter((c) => !c.alwaysVisible);

  const handleFieldChange = (key: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      templateFields: { ...prev.templateFields, [key]: value },
    }));
  };

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
          <span className="text-xs text-muted-foreground">
            {formState.promptText.length} / {PROMPT_MAX_LENGTH.toLocaleString()}
          </span>
        </div>
        <PromptQualityChecklist
          text={formState.promptText}
          onInsertSnippet={(snippet) =>
            setFormState((prev) => ({ ...prev, promptText: prev.promptText + snippet }))
          }
        />
      </TabsContent>

      <TabsContent value="template" className="mt-3 space-y-3">
        {/* Core fields (always visible, not in accordion) */}
        {coreCategory?.fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <Label className="text-sm font-medium">{field.label}</Label>
            <TemplateFieldRenderer
              field={field}
              value={formState.templateFields[field.key] || ''}
              onChange={(value) => handleFieldChange(field.key, value)}
            />
          </div>
        ))}

        {/* Expandable category groups */}
        <Accordion type="multiple" value={expandedSections} onValueChange={handleAccordionChange}>
          {accordionCategories.map((category) => {
            const hasContent = categoryHasContent(category.id, formState.templateFields);
            return (
              <AccordionItem key={category.id} value={category.id} className="border-b-0">
                <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
                  <span className="flex items-center gap-2">
                    {category.label}
                    {category.description && (
                      <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
                        {category.description}
                      </span>
                    )}
                    {hasContent && !expandedSections.includes(category.id) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pl-1">
                    {category.fields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-sm font-medium">{field.label}</Label>
                        {field.description && (
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        )}
                        <TemplateFieldRenderer
                          field={field}
                          value={formState.templateFields[field.key] || ''}
                          onChange={(value) => handleFieldChange(field.key, value)}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {debouncedPreview && (
          <div className="p-3 rounded-md bg-muted text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Preview: </span>
            <span className="whitespace-pre-wrap">{debouncedPreview}</span>
          </div>
        )}
        <PromptQualityChecklist text={effectivePrompt} />
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
  intensity: EnhancePromptIntensity;
  onIntensityChange: (intensity: EnhancePromptIntensity) => void;
  enhancementMode: EnhancementMode;
  onEnhancementModeChange: (mode: EnhancementMode) => void;
  modelOverride: UseModelOverrideResult;
  showSystemPrompt: boolean;
  customSystemPrompt: string;
  onToggleSystemPrompt: () => void;
  onSystemPromptChange: (value: string) => void;
  onEnhance: () => void;
  onAcceptOriginal: () => void;
  onAcceptEnhanced: () => void;
  onEnhancedPromptEdit: (value: string) => void;
}

const INTENSITY_OPTIONS: { value: EnhancePromptIntensity; label: string }[] = [
  { value: 'refine', label: 'Refine' },
  { value: 'expand', label: 'Expand' },
  { value: 'structure', label: 'Structure' },
];

function EnhancePromptSection({
  showEnhanceComparison,
  enhancedPrompt,
  effectivePrompt,
  canEnhance,
  enhanceIsPending,
  enhanceError,
  intensity,
  onIntensityChange,
  enhancementMode,
  onEnhancementModeChange,
  modelOverride,
  showSystemPrompt,
  customSystemPrompt,
  onToggleSystemPrompt,
  onSystemPromptChange,
  onEnhance,
  onAcceptOriginal,
  onAcceptEnhanced,
  onEnhancedPromptEdit,
}: EnhanceProps) {
  const [previewMode, setPreviewMode] = useState(getPreviewPreference);

  const handlePreviewModeChange = useCallback((preview: boolean) => {
    setPreviewMode(preview);
    setPreviewPreference(preview);
  }, []);

  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onEnhance} disabled={!canEnhance} className="gap-2">
            {enhanceIsPending ? <Spinner size="sm" /> : <Sparkles className="w-4 h-4" />}
            {showEnhanceComparison ? 'Enhance Again' : 'Enhance Prompt'}
          </Button>
          <div className="flex rounded-md border overflow-hidden">
            {INTENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  intensity === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                )}
                onClick={() => onIntensityChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {ENHANCEMENT_MODE_LABELS[enhancementMode]}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Rewrite</DropdownMenuLabel>
              {REWRITE_MODES.map((mode) => (
                <DropdownMenuItem key={mode} onClick={() => onEnhancementModeChange(mode)}>
                  {ENHANCEMENT_MODE_LABELS[mode]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Append Details</DropdownMenuLabel>
              {ADDITIVE_MODES.map((mode) => (
                <DropdownMenuItem key={mode} onClick={() => onEnhancementModeChange(mode)}>
                  {ENHANCEMENT_MODE_LABELS[mode]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ModelOverrideTrigger
            currentModelEntry={modelOverride.effectiveModelEntry}
            onModelChange={modelOverride.setOverride}
            phase="ideationModel"
            isOverridden={modelOverride.isOverridden}
            size="sm"
            variant="icon"
          />
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

      {showEnhanceComparison && enhancedPrompt && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              Enhanced with {INTENSITY_OPTIONS.find((o) => o.value === intensity)?.label}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground uppercase">Your Prompt</div>
              <Button variant="outline" size="sm" onClick={onAcceptOriginal} className="gap-1">
                <Undo2 className="w-3 h-3" />
                Use Original
              </Button>
            </div>
            <PromptViewer
              content={effectivePrompt}
              previewMode={previewMode}
              onPreviewModeChange={handlePreviewModeChange}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-primary uppercase">Enhanced Version</div>
              <Button size="sm" onClick={onAcceptEnhanced} className="gap-1">
                <Check className="w-3 h-3" />
                Use Enhanced
              </Button>
            </div>
            <PromptViewer
              content={enhancedPrompt}
              editable
              onChange={onEnhancedPromptEdit}
              previewMode={previewMode}
              onPreviewModeChange={handlePreviewModeChange}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto gap-1 text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  Start from...
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {PROMPT_PATTERNS.map((pattern) => (
                  <DropdownMenuItem
                    key={pattern.id}
                    onClick={() => form.applyPattern(pattern)}
                    className="flex flex-col items-start gap-0.5"
                  >
                    <span className="font-medium">{pattern.label}</span>
                    <span className="text-xs text-muted-foreground">{pattern.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
            enhancementMode={form.formState.enhancementMode}
            onEnhancementModeChange={(enhancementMode) =>
              form.setFormState((prev) => ({ ...prev, enhancementMode }))
            }
            modelOverride={form.modelOverride}
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
