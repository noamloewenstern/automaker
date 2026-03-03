// @ts-nocheck - Claude settings form with CLI status and authentication state
import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { useSetupStore } from '@/store/setup-store';
import { useCliStatus } from '../hooks/use-cli-status';
import { ClaudeCliStatus } from '../cli-status/claude-cli-status';
import { ClaudeMdSettings } from '../claude/claude-md-settings';
import { ClaudeUsageSection } from '../api-keys/claude-usage-section';
import { SkillsSection } from './claude-settings-tab/skills-section';
import { SubagentsSection } from './claude-settings-tab/subagents-section';
import { ApiProfilesSection } from './claude-settings-tab/api-profiles-section';
import { ProviderToggle } from './provider-toggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Info, Plus, X } from 'lucide-react';

/**
 * Key-value pair editor for CLI flags or environment variables.
 * Renders a list of rows with key/value inputs and add/remove controls.
 */
function KeyValueEditor({
  entries,
  onChange,
  keyPlaceholder,
  valuePlaceholder,
  helpText,
  allowNullValue,
}: {
  entries: Record<string, string | null>;
  onChange: (entries: Record<string, string | null>) => void;
  keyPlaceholder: string;
  valuePlaceholder: string;
  helpText: string;
  /** If true, empty value string is stored as null (for boolean CLI flags) */
  allowNullValue?: boolean;
}) {
  const pairs = Object.entries(entries);

  const handleAdd = () => {
    onChange({ ...entries, '': allowNullValue ? null : '' });
  };

  const handleRemove = (key: string) => {
    const next = { ...entries };
    delete next[key];
    onChange(next);
  };

  const handleKeyChange = (oldKey: string, newKey: string) => {
    // Rebuild the record preserving order but with the new key
    const next: Record<string, string | null> = {};
    for (const [k, v] of Object.entries(entries)) {
      if (k === oldKey) {
        next[newKey] = v;
      } else {
        next[k] = v;
      }
    }
    onChange(next);
  };

  const handleValueChange = (key: string, value: string) => {
    onChange({
      ...entries,
      [key]: allowNullValue && value === '' ? null : value,
    });
  };

  return (
    <div className="space-y-2">
      {pairs.map(([key, value], index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={key}
            onChange={(e) => handleKeyChange(key, e.target.value)}
            placeholder={keyPlaceholder}
            className="font-mono text-sm flex-1"
          />
          <Input
            value={value ?? ''}
            onChange={(e) => handleValueChange(key, e.target.value)}
            placeholder={valuePlaceholder}
            className="font-mono text-sm flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => handleRemove(key)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd} className="gap-1">
        <Plus className="h-3 w-3" />
        Add
      </Button>
      <p className="text-xs text-muted-foreground">{helpText}</p>
    </div>
  );
}

export function ClaudeSettingsTab() {
  const {
    apiKeys,
    autoLoadClaudeMd,
    setAutoLoadClaudeMd,
    useClaudeCodeSystemPrompt,
    setUseClaudeCodeSystemPrompt,
    claudeCodeExecutablePath,
    setClaudeCodeExecutablePath,
    claudeCodeExtraArgs,
    setClaudeCodeExtraArgs,
    claudeCodeEnvVars,
    setClaudeCodeEnvVars,
  } = useAppStore();
  const { claudeAuthStatus } = useSetupStore();

  // Use CLI status hook
  const { claudeCliStatus, isCheckingClaudeCli, handleRefreshClaudeCli } = useCliStatus();

  // Hide usage tracking when using API key (only show for Claude Code CLI users)
  // Also hide on Windows for now (CLI usage command not supported)
  const isWindows =
    typeof navigator !== 'undefined' && navigator.platform?.toLowerCase().includes('win');
  const showUsageTracking = !apiKeys.anthropic && !isWindows;

  const handleExtraArgsChange = useCallback(
    (args: Record<string, string | null>) => {
      setClaudeCodeExtraArgs(Object.keys(args).length > 0 ? args : undefined);
    },
    [setClaudeCodeExtraArgs]
  );

  const handleEnvVarsChange = useCallback(
    (vars: Record<string, string | null>) => {
      // Filter out null values for env vars (they should always be strings)
      const stringVars: Record<string, string> = {};
      for (const [k, v] of Object.entries(vars)) {
        stringVars[k] = v ?? '';
      }
      setClaudeCodeEnvVars(Object.keys(stringVars).length > 0 ? stringVars : undefined);
    },
    [setClaudeCodeEnvVars]
  );

  return (
    <div className="space-y-6">
      {/* Provider Visibility Toggle */}
      <ProviderToggle provider="claude" providerLabel="Claude" />

      {/* Usage Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-400/90">
          <span className="font-medium">Primary Provider</span>
          <p className="text-xs text-blue-400/70 mt-1">
            Claude is used throughout the app including chat, analysis, and agent tasks.
          </p>
        </div>
      </div>

      <ClaudeCliStatus
        status={claudeCliStatus}
        authStatus={claudeAuthStatus}
        isChecking={isCheckingClaudeCli}
        onRefresh={handleRefreshClaudeCli}
      />

      {/* Claude Code CLI Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Claude Code CLI</h3>

        {/* Executable Path */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Executable Path</Label>
          <Input
            value={claudeCodeExecutablePath ?? ''}
            onChange={(e) => setClaudeCodeExecutablePath(e.target.value || undefined)}
            placeholder="Auto-detected from PATH (e.g. ~/.local/bin/claude)"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Custom path to the Claude Code binary. When empty, the SDK auto-detects{' '}
            <code className="text-[0.7rem]">claude</code> from your system PATH. Per-provider paths
            override this global setting.
          </p>
        </div>

        {/* CLI Flags */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">CLI Flags</Label>
          <KeyValueEditor
            entries={claudeCodeExtraArgs ?? {}}
            onChange={handleExtraArgsChange}
            keyPlaceholder="Flag name (without --)"
            valuePlaceholder="Value (empty = boolean flag)"
            helpText={'e.g. "dangerously-skip-permissions" (no value) or "timeout" = "60000"'}
            allowNullValue
          />
        </div>

        {/* Environment Variables */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Environment Variables</Label>
          <KeyValueEditor
            entries={claudeCodeEnvVars ?? {}}
            onChange={handleEnvVarsChange}
            keyPlaceholder="Variable name"
            valuePlaceholder="Value"
            helpText="e.g. CLAUDE_CONFIG_DIR = ~/.claude-ziv"
          />
        </div>
      </div>

      {/* Claude-compatible providers */}
      <ApiProfilesSection />

      <ClaudeMdSettings
        autoLoadClaudeMd={autoLoadClaudeMd}
        onAutoLoadClaudeMdChange={setAutoLoadClaudeMd}
        useClaudeCodeSystemPrompt={useClaudeCodeSystemPrompt}
        onUseClaudeCodeSystemPromptChange={setUseClaudeCodeSystemPrompt}
      />

      {/* Skills Configuration */}
      <SkillsSection />

      {/* Custom Subagents */}
      <SubagentsSection />

      {showUsageTracking && <ClaudeUsageSection />}
    </div>
  );
}

export default ClaudeSettingsTab;
