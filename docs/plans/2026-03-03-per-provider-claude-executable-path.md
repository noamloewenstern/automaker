# Per-Provider Claude Code Executable Path — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow each Claude-compatible provider to specify a custom Claude Code executable path, passed to the SDK as `pathToClaudeCodeExecutable`.

**Architecture:** Add an optional `claudeCodeExecutablePath` field to both provider types (`ClaudeCompatibleProvider`, `ClaudeApiProfile`), forward it in `ClaudeProvider.executeQuery()`, and expose it in the provider settings UI form.

**Tech Stack:** TypeScript types, Vitest, React (shadcn Input/Label)

---

### Task 1: Add `claudeCodeExecutablePath` to Type Definitions

**Files:**

- Modify: `libs/types/src/settings.ts:479` (after `providerSettings` in `ClaudeCompatibleProvider`)
- Modify: `libs/types/src/settings.ts:518` (after `disableNonessentialTraffic` in `ClaudeApiProfile`)

**Step 1: Add field to `ClaudeCompatibleProvider`**

In `libs/types/src/settings.ts`, find line 479 (`providerSettings?: Record<string, unknown>;`) and add after the closing `}` of that interface member, before the interface closing `}` on line 480:

```typescript
  /** Path to a custom Claude Code executable. Uses SDK default if not specified. */
  claudeCodeExecutablePath?: string;
```

The interface should end like:

```typescript
  /** Provider-specific settings for future extensibility */
  providerSettings?: Record<string, unknown>;

  /** Path to a custom Claude Code executable. Uses SDK default if not specified. */
  claudeCodeExecutablePath?: string;
}
```

**Step 2: Add field to `ClaudeApiProfile`**

In the same file, find line 518 (`disableNonessentialTraffic?: boolean;`) and add after it, before the interface closing `}` on line 519:

```typescript
  /** Path to a custom Claude Code executable. Uses SDK default if not specified. */
  claudeCodeExecutablePath?: string;
```

The interface should end like:

```typescript
  /** Set CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 */
  disableNonessentialTraffic?: boolean;
  /** Path to a custom Claude Code executable. Uses SDK default if not specified. */
  claudeCodeExecutablePath?: string;
}
```

**Step 3: Verify types compile**

Run: `cd libs/types && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add libs/types/src/settings.ts
git commit -m "feat: add claudeCodeExecutablePath to provider types"
```

---

### Task 2: Write Failing Test for Provider Passthrough

**Files:**

- Modify: `apps/server/tests/unit/providers/claude-provider.test.ts`

**Step 1: Add test for `pathToClaudeCodeExecutable` passthrough**

In `apps/server/tests/unit/providers/claude-provider.test.ts`, add a new test inside the `executeQuery` describe block (after the existing test at line ~222, before the error handling test):

```typescript
it('should pass pathToClaudeCodeExecutable when claudeCompatibleProvider has claudeCodeExecutablePath', async () => {
  vi.mocked(sdk.query).mockReturnValue(
    (async function* () {
      yield { type: 'text', text: 'test' };
    })()
  );

  const generator = provider.executeQuery({
    prompt: 'Test',
    model: 'claude-opus-4-6',
    cwd: '/test',
    claudeCompatibleProvider: {
      id: 'test-provider',
      name: 'Test Provider',
      providerType: 'custom',
      baseUrl: 'https://example.com',
      apiKeySource: 'inline',
      apiKey: 'test-key',
      models: [],
      claudeCodeExecutablePath: '/custom/path/to/claude',
    },
  });

  await collectAsyncGenerator(generator);

  expect(sdk.query).toHaveBeenCalledWith({
    prompt: 'Test',
    options: expect.objectContaining({
      pathToClaudeCodeExecutable: '/custom/path/to/claude',
    }),
  });
});

it('should not include pathToClaudeCodeExecutable when claudeCodeExecutablePath is not set', async () => {
  vi.mocked(sdk.query).mockReturnValue(
    (async function* () {
      yield { type: 'text', text: 'test' };
    })()
  );

  const generator = provider.executeQuery({
    prompt: 'Test',
    model: 'claude-opus-4-6',
    cwd: '/test',
    claudeCompatibleProvider: {
      id: 'test-provider',
      name: 'Test Provider',
      providerType: 'custom',
      baseUrl: 'https://example.com',
      apiKeySource: 'inline',
      apiKey: 'test-key',
      models: [],
    },
  });

  await collectAsyncGenerator(generator);

  expect(sdk.query).toHaveBeenCalledWith({
    prompt: 'Test',
    options: expect.not.objectContaining({
      pathToClaudeCodeExecutable: expect.anything(),
    }),
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:server -- apps/server/tests/unit/providers/claude-provider.test.ts`
Expected: The first new test FAILS (pathToClaudeCodeExecutable not present in SDK call). The second should PASS already (since the field isn't passed through yet).

**Step 3: Commit failing test**

```bash
git add apps/server/tests/unit/providers/claude-provider.test.ts
git commit -m "test: add failing tests for claudeCodeExecutablePath passthrough"
```

---

### Task 3: Implement Provider Passthrough

**Files:**

- Modify: `apps/server/src/providers/claude-provider.ts:250` (inside `sdkOptions` construction)

**Step 1: Add passthrough to sdkOptions**

In `apps/server/src/providers/claude-provider.ts`, find the `sdkOptions` object construction (lines 220-251). Add the following line after the `outputFormat` spread (line 250), before the closing `};` on line 251:

```typescript
      // Custom Claude Code executable path from provider config
      ...(providerConfig?.claudeCodeExecutablePath && {
        pathToClaudeCodeExecutable: providerConfig.claudeCodeExecutablePath,
      }),
```

The end of the `sdkOptions` block should look like:

```typescript
      // Pass through outputFormat for structured JSON outputs
      ...(options.outputFormat && { outputFormat: options.outputFormat }),
      // Custom Claude Code executable path from provider config
      ...(providerConfig?.claudeCodeExecutablePath && {
        pathToClaudeCodeExecutable: providerConfig.claudeCodeExecutablePath,
      }),
    };
```

**Step 2: Run tests to verify they pass**

Run: `npm run test:server -- apps/server/tests/unit/providers/claude-provider.test.ts`
Expected: ALL tests PASS, including the two new ones.

**Step 3: Commit**

```bash
git add apps/server/src/providers/claude-provider.ts
git commit -m "feat: forward claudeCodeExecutablePath to Claude Agent SDK"
```

---

### Task 4: Add UI Form Field

**Files:**

- Modify: `apps/ui/src/components/views/settings-view/providers/claude-settings-tab/api-profiles-section.tsx`

**Step 1: Add `claudeCodeExecutablePath` to `ProviderFormData` interface**

In `api-profiles-section.tsx`, find the `ProviderFormData` interface (line 95). Add the new field:

```typescript
interface ProviderFormData {
  name: string;
  providerType: ClaudeCompatibleProviderType;
  baseUrl: string;
  apiKeySource: ApiKeySource;
  apiKey: string;
  useAuthToken: boolean;
  timeoutMs: string;
  models: ModelFormEntry[];
  disableNonessentialTraffic: boolean;
  claudeCodeExecutablePath: string;
}
```

**Step 2: Add default to `emptyFormData`**

Find `emptyFormData` (line 107) and add:

```typescript
const emptyFormData: ProviderFormData = {
  name: '',
  providerType: 'custom',
  baseUrl: '',
  apiKeySource: 'inline',
  apiKey: '',
  useAuthToken: false,
  timeoutMs: '',
  models: [],
  disableNonessentialTraffic: false,
  claudeCodeExecutablePath: '',
};
```

**Step 3: Populate field when opening edit dialog**

Find `handleOpenEditDialog` (~line 183). In the `setFormData` call (~line 186-200), add:

```typescript
claudeCodeExecutablePath: provider.claudeCodeExecutablePath ?? '',
```

**Step 4: Populate field when opening add dialog from template**

Find `handleOpenAddDialog` (~line 146). In the template `setFormData` call (~line 152-166), add:

```typescript
claudeCodeExecutablePath: '',
```

**Step 5: Save field in `handleSave`**

Find `handleSave` (~line 209). In the `providerData` object (~line 227-248), add before the closing:

```typescript
claudeCodeExecutablePath: formData.claudeCodeExecutablePath.trim() || undefined,
```

**Step 6: Add form input field**

Find the Timeout input section (~line 560-570). Add the following **after** it (before the `{/* Models */}` section at line 572):

```tsx
{
  /* Claude Code Executable Path */
}
<div className="space-y-2">
  <Label htmlFor="provider-executable-path">Claude Code Executable Path</Label>
  <Input
    id="provider-executable-path"
    type="text"
    value={formData.claudeCodeExecutablePath}
    onChange={(e) => setFormData({ ...formData, claudeCodeExecutablePath: e.target.value })}
    placeholder="/path/to/claude"
  />
  <p className="text-xs text-muted-foreground">
    Leave empty to use the default Claude Code binary.
  </p>
</div>;
```

**Step 7: Build the UI to verify no compile errors**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 8: Commit**

```bash
git add apps/ui/src/components/views/settings-view/providers/claude-settings-tab/api-profiles-section.tsx
git commit -m "feat: add Claude Code executable path field to provider settings UI"
```

---

### Task 5: Run Full Test Suite

**Step 1: Run all server tests**

Run: `npm run test:server`
Expected: All tests pass.

**Step 2: Run package tests**

Run: `npm run test:packages`
Expected: All tests pass.

**Step 3: Final commit (if any formatting fixes needed)**

Run: `npm run format`
Then commit any formatting changes if needed.
