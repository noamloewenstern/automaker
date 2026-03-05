import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIdeationStore } from '@/store/ideation-store';
import { TEMPLATE_FIELDS, type TemplateFieldDefinition } from '../constants';

// ============================================================================
// SuggestionChips (moved from custom-prompt-dialog.tsx)
// ============================================================================

const EMPTY_SUGGESTIONS: string[] = [];

export function SuggestionChips({
  fieldKey,
  presetSuggestions,
  currentValue,
  onValueChange,
}: {
  fieldKey: string;
  presetSuggestions?: string[];
  currentValue: string;
  onValueChange: (value: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const recentSuggestions = useIdeationStore(
    (s) => s.recentTemplateSuggestions[fieldKey] ?? EMPTY_SUGGESTIONS
  );
  const addRecentSuggestion = useIdeationStore((s) => s.addRecentSuggestion);

  // Use explicit presets if provided, otherwise look up from TEMPLATE_FIELDS
  const suggestions =
    presetSuggestions ?? TEMPLATE_FIELDS.find((f) => f.key === fieldKey)?.suggestions;
  if (!suggestions?.length && !recentSuggestions.length) return null;

  const presetSet = new Set(suggestions ?? []);
  // Merge recent first, then defaults, deduped
  const allSuggestions = [...new Set([...recentSuggestions, ...(suggestions ?? [])])];
  const displaySuggestions = showAll ? allSuggestions : allSuggestions.slice(0, 12);

  // Parse current comma-separated values
  const selectedValues = currentValue
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const isSelected = (suggestion: string) => selectedValues.includes(suggestion.toLowerCase());

  const toggleSuggestion = (suggestion: string) => {
    if (isSelected(suggestion)) {
      const newValues = selectedValues.filter((v) => v !== suggestion.toLowerCase());
      onValueChange(newValues.join(', '));
    } else {
      const newValues = [...selectedValues, suggestion];
      onValueChange(newValues.join(', '));
      addRecentSuggestion(fieldKey, suggestion);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {displaySuggestions.map((suggestion) => {
          const isLearned = !presetSet.has(suggestion);
          return (
            <Badge
              key={suggestion}
              variant={isSelected(suggestion) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer hover:opacity-80 transition-opacity',
                isLearned && !isSelected(suggestion) && 'border-dashed'
              )}
              onClick={() => toggleSuggestion(suggestion)}
            >
              {isLearned && <User className="w-2.5 h-2.5 mr-1 opacity-60" />}
              {suggestion}
            </Badge>
          );
        })}
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
// Field Renderers
// ============================================================================

interface FieldRendererProps {
  field: TemplateFieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

function TextChipsField({ field, value, onChange }: FieldRendererProps) {
  const addRecentSuggestion = useIdeationStore((s) => s.addRecentSuggestion);

  const handleBlur = () => {
    if (!value.trim()) return;
    // Learn any custom values not in presets
    const presetSet = new Set(field.suggestions ?? []);
    const values = value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    for (const v of values) {
      if (!presetSet.has(v)) {
        addRecentSuggestion(field.key, v);
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={field.placeholder}
      />
      <SuggestionChips
        fieldKey={field.key}
        presetSuggestions={field.suggestions}
        currentValue={value}
        onValueChange={onChange}
      />
    </div>
  );
}

function TextareaField({ field, value, onChange }: FieldRendererProps) {
  const addRecentSuggestion = useIdeationStore((s) => s.addRecentSuggestion);

  const handleBlur = () => {
    if (!value.trim() || !field.suggestions?.length) return;
    const presetSet = new Set(field.suggestions);
    if (!presetSet.has(value.trim())) {
      addRecentSuggestion(field.key, value.trim());
    }
  };

  return (
    <div className="space-y-1.5">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={field.placeholder}
        rows={3}
        className="resize-y"
      />
      {field.suggestions && field.suggestions.length > 0 && (
        <SuggestionChips
          fieldKey={field.key}
          presetSuggestions={field.suggestions}
          currentValue={value}
          onValueChange={onChange}
        />
      )}
    </div>
  );
}

function DropdownField({ field, value, onChange }: FieldRendererProps) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={field.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {field.options?.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RadioGroupField({ field, value, onChange }: FieldRendererProps) {
  return (
    <RadioGroup
      value={value || undefined}
      onValueChange={onChange}
      className={cn(
        'gap-2',
        field.options && field.options.length <= 4 ? 'flex flex-wrap' : 'grid'
      )}
    >
      {field.options?.map((opt) => (
        <div key={opt.value} className="flex items-center gap-2">
          <RadioGroupItem value={opt.value} id={`${field.key}-${opt.value}`} />
          <Label
            htmlFor={`${field.key}-${opt.value}`}
            className="text-sm cursor-pointer font-normal"
          >
            {opt.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function MultiCheckField({ field, value, onChange }: FieldRendererProps) {
  const selectedValues = value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  const selectedSet = new Set(selectedValues);

  const toggleValue = (optValue: string) => {
    if (selectedSet.has(optValue)) {
      const newValues = selectedValues.filter((v) => v !== optValue);
      onChange(newValues.join(', '));
    } else {
      onChange([...selectedValues, optValue].join(', '));
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {field.options?.map((opt) => (
        <div key={opt.value} className="flex items-center gap-2">
          <Checkbox
            id={`${field.key}-${opt.value}`}
            checked={selectedSet.has(opt.value)}
            onCheckedChange={() => toggleValue(opt.value)}
          />
          <Label
            htmlFor={`${field.key}-${opt.value}`}
            className="text-sm cursor-pointer font-normal"
          >
            {opt.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Renderer
// ============================================================================

export function TemplateFieldRenderer({ field, value, onChange }: FieldRendererProps) {
  switch (field.inputType) {
    case 'text-chips':
      return <TextChipsField field={field} value={value} onChange={onChange} />;
    case 'textarea':
      return <TextareaField field={field} value={value} onChange={onChange} />;
    case 'dropdown':
      return <DropdownField field={field} value={value} onChange={onChange} />;
    case 'radio':
      return <RadioGroupField field={field} value={value} onChange={onChange} />;
    case 'multicheck':
      return <MultiCheckField field={field} value={value} onChange={onChange} />;
  }
}
