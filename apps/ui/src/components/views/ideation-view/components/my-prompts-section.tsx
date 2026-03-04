/**
 * MyPromptsSection - Displays saved custom prompts and prompt history
 */

import { useState } from 'react';
import { PenLine, Trash2, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useAppStore } from '@/store/app-store';
import { useIdeationStore } from '@/store/ideation-store';
import { useCustomPrompts, usePromptHistory } from '@/hooks/queries/use-ideation';
import { useDeleteCustomPrompt } from '@/hooks/mutations';
import type { CustomIdeationPrompt, CustomPromptHistoryEntry } from '@automaker/types';

export function MyPromptsSection() {
  const currentProject = useAppStore((s) => s.currentProject);
  const projectPath = currentProject?.path ?? '';
  const { openCustomPromptDialog } = useIdeationStore();

  const { data: customPrompts, isLoading } = useCustomPrompts(projectPath || undefined);
  const { data: history } = usePromptHistory(projectPath || undefined);
  const deleteMutation = useDeleteCustomPrompt(projectPath);

  const [historyExpanded, setHistoryExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <Spinner size="sm" />
        <span className="text-sm">Loading custom prompts...</span>
      </div>
    );
  }

  const hasPrompts = customPrompts && customPrompts.length > 0;
  const hasHistory = history && history.length > 0;

  if (!hasPrompts && !hasHistory) return null;

  const handleEditPrompt = (prompt: CustomIdeationPrompt) => {
    openCustomPromptDialog(prompt.category ?? null, prompt);
  };

  const handleDelete = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(promptId);
  };

  const handleReuseHistoryEntry = (entry: CustomPromptHistoryEntry) => {
    openCustomPromptDialog(entry.category ?? null, {
      id: '',
      title: '',
      prompt: entry.promptText,
      category: entry.category,
      isTemplate: false,
      createdAt: '',
      updatedAt: '',
    } as CustomIdeationPrompt);
  };

  return (
    <div className="space-y-3">
      {/* Saved prompts */}
      {hasPrompts && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <PenLine className="w-4 h-4" />
            My Prompts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {customPrompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="group cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md"
                onClick={() => handleEditPrompt(prompt)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {prompt.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {prompt.prompt}
                      </p>
                      {prompt.category && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {prompt.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPrompt(prompt);
                        }}
                      >
                        <PenLine className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(prompt.id, e)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* History */}
      {hasHistory && (
        <div>
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            {historyExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Clock className="w-4 h-4" />
            Prompt History ({history.length})
          </button>

          {historyExpanded && (
            <div className="mt-2 space-y-2">
              {history.slice(0, 20).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-foreground">{entry.promptText}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {entry.category && (
                        <Badge variant="outline" className="text-xs">
                          {entry.category}
                        </Badge>
                      )}
                      <span>{entry.suggestionsCount} ideas</span>
                      <span>{new Date(entry.usedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleReuseHistoryEntry(entry)}
                  >
                    Reuse
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
