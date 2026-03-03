# Per-Provider Claude Code Executable Path

**Date:** 2026-03-03
**Status:** Approved

## Problem

Automaker uses the Claude Agent SDK to execute AI agents. The SDK accepts a `pathToClaudeCodeExecutable` option but Automaker never passes it, relying entirely on the SDK's built-in binary auto-detection. Users with custom/patched Claude Code binaries have no way to specify which binary to use.

## Solution

Add an optional `claudeCodeExecutablePath` field to both `ClaudeCompatibleProvider` and `ClaudeApiProfile` types. When set, `ClaudeProvider` passes it as `pathToClaudeCodeExecutable` to the SDK. When unset (default), the SDK uses its built-in executable (current behavior preserved).

## Changes

### 1. Type: `libs/types/src/settings.ts`

Add to `ClaudeCompatibleProvider` (after `providerSettings`):

```typescript
/** Path to a custom Claude Code executable. Uses SDK default if not specified. */
claudeCodeExecutablePath?: string;
```

Add to `ClaudeApiProfile` (after `disableNonessentialTraffic`):

```typescript
/** Path to a custom Claude Code executable. Uses SDK default if not specified. */
claudeCodeExecutablePath?: string;
```

### 2. Provider: `apps/server/src/providers/claude-provider.ts`

In `executeQuery()`, add to `sdkOptions` construction:

```typescript
...(providerConfig?.claudeCodeExecutablePath && {
  pathToClaudeCodeExecutable: providerConfig.claudeCodeExecutablePath,
}),
```

### 3. UI: Provider settings form

Add a text input for "Claude Code Executable Path" in the provider settings UI with placeholder `/path/to/claude` and helper text "Leave empty to use the default Claude Code binary."

## Non-goals

- No global setting or env var fallback (per-provider only)
- No validation of the path at save time (SDK handles errors at runtime)
- No changes to CLI detection (`cli-detection.ts`) or system paths (`system-paths.ts`)
