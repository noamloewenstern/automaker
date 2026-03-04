# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Automaker is an autonomous AI development studio — an npm workspace monorepo where AI agents (Claude Agent SDK) implement features on a Kanban board in isolated git worktrees. Node.js >=22.0.0 <23.0.0.

## Commands

```bash
# Development
npm run dev                 # Interactive launcher (web or electron)
npm run dev:web             # Web browser mode (localhost:3007)
npm run dev:electron        # Desktop app mode
npm run dev:electron:debug  # Desktop with DevTools open

# Building (IMPORTANT: build:packages must run before any app build)
npm run build:packages      # Build all shared packages first
npm run build               # Build web app (runs build:packages automatically)
npm run build:server        # Build server only
npm run build:electron      # Build desktop app

# Testing
npm run test                # E2E tests (Playwright)
npm run test:server         # Server unit tests (Vitest)
npm run test:server -- tests/unit/specific.test.ts  # Single test file
npm run test:packages       # All lib tests (excludes server)
npm run test:all            # All unit tests (vitest workspace)

# Verification
npm run typecheck           # TypeScript check (UI workspace only)
npm run lint                # ESLint (UI workspace)
npm run lint:errors         # ESLint errors only, no warnings
npm run lint:server:errors  # Server ESLint errors only
npm run format:check        # Prettier check
```

## Architecture

### Monorepo Layout

- `apps/ui/` — React 19 + Vite 7 + Electron 39 frontend (port 3007). TanStack Router, TanStack Query, Zustand 5, Tailwind CSS 4, shadcn/ui
- `apps/server/` — Express 5 + WebSocket backend (port 3008). Claude Agent SDK, node-pty
- `libs/` — Shared packages (`@automaker/*`): types, utils, prompts, platform, spec-parser, model-resolver, dependency-resolver, git-utils

### Package Build Order (strict)

```
@automaker/types → @automaker/platform → @automaker/utils + spec-parser + prompts + model-resolver + dependency-resolver → @automaker/git-utils
```

Packages can only depend on packages above them. Build order is enforced in `build:packages`. All libs use plain `tsc` (no bundler), ESM (`"type": "module"`), output to `dist/`.

### Server Patterns

**Route factory pattern** — each route module exports `createXxxRoutes(...services): Router`. Services are dependency-injected at startup in `index.ts`, not imported globally:

```typescript
// apps/server/src/routes/features/index.ts
export function createFeaturesRoutes(featureLoader: FeatureLoader, events: EventEmitter): Router;
```

**Route handler pattern** — handler factories return async `(req, res) => void` with try/catch:

```typescript
return async (req: Request, res: Response): Promise<void> => {
  try {
    // business logic
    res.json({ success: true, ... });
  } catch (error) {
    logError(error, 'Context message');
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};
```

**No schema validation library** — routes validate manually with `typeof` checks and return 400. Path params validated via `validatePathParams('projectPath', 'workingDirectory?', 'imagePaths[]')` middleware.

**Event system** — `createEventEmitter()` in `lib/events.ts` returns `{ emit(type, payload), subscribe(callback) }`. 94 event types defined in `libs/types/src/event.ts`. Events stream to frontend via WebSocket JSON: `{ type: EventType, payload: unknown }`.

**Two WebSocket servers**:

1. `/api/events` — broadcasts all server events via `events.subscribe()`
2. `/api/terminal/ws` — per-session PTY with scrollback buffer on reconnect

**Auth** — two modes: `X-API-Key` header (Electron) and `automaker_session` cookie (web). Unauthenticated: `/api/health`, `/api/auth`, `/api/setup`.

**Service pattern** — classes use constructor injection, `initialize()` for async setup, singletons created in `index.ts`. No DI container.

### Frontend Patterns

**API client** — `getElectronAPI()` in `lib/electron.ts` always returns `HttpApiClient` singleton (NOT a real Electron IPC bridge). The `ElectronAPI` interface is a unified API surface for both modes. All API namespaces: `features`, `autoMode`, `worktree`, `git`, `github`, `ideation`, `settings`, etc.

**Query key factory** — `queryKeys` object in `lib/query-keys.ts` follows TkDodo's factory pattern:

```typescript
queryKeys.features.all(projectPath); // ['features', projectPath]
queryKeys.features.single(projectPath, id); // ['features', projectPath, id]
queryKeys.settings.global(); // ['settings', 'global']
```

**WebSocket → Query invalidation bridge** — `useAutoModeQueryInvalidation()` hook subscribes to WS events and calls `queryClient.invalidateQueries()`. Debounced for high-frequency streaming events.

**Zustand selector rule** — ALWAYS use individual selectors, never bare `useAppStore()`:

```typescript
// ✅ Correct
const projects = useAppStore((s) => s.projects);
// ❌ Wrong — re-renders on every store mutation
const store = useAppStore();
```

**5 Zustand stores**: `app-store` (main), `auth-store`, `setup-store`, `ideation-store` (persisted), `ui-cache-store`. Only `ideation-store` uses Zustand persist middleware — others sync via API.

**Theme system** — 40 themes (20 dark, 20 light) via CSS class on `<html>`. Applied synchronously before React hydration to prevent flash. CSS variables in `oklch()` color space.

**Mutation pattern** — `onSuccess` always invalidates relevant query keys, `onError` always shows `toast.error` via sonner. Access store state in callbacks via `useXxxStore.getState()` (not hooks).

### Prompt System

Custom prompts use a `CustomPrompt` type: `{ enabled: boolean; value: string }`. Resolution: if `enabled === true`, use custom `value`; otherwise use default from `@automaker/prompts`. Merge functions in `libs/prompts/src/merge.ts`: `mergeAutoModePrompts()`, `mergeAgentPrompts()`, etc.

## Gotchas and Non-Obvious Patterns

- **Feature `status` is an untyped string** — `Feature.status?: string` with `[key: string]: unknown` catch-all. Known values: `backlog`, `pending`, `in_progress`, `waiting_approval`, `verified`, `completed`, `failed`, `interrupted`, `pipeline_*` prefix. No enum — check by string comparison.
- **Model resolution is case-sensitive** — `"sonnet"` resolves, `"SONNET"` passes through unchanged. Canonical aliases: `claude-haiku` → `claude-haiku-4-5-20251001`, `claude-sonnet` → `claude-sonnet-4-6`, `claude-opus` → `claude-opus-4-6`. Legacy aliases (`haiku`, `sonnet`, `opus`) still work via `migrateModelId()`.
- **Settings have versioned migrations** — `SETTINGS_VERSION` (currently 5) in `apps/server/src/types/settings.ts`. `getGlobalSettings()` runs v1→v2→v3→v4→v5 migrations and saves back to disk.
- **Atomic file writes everywhere** — `atomicWriteJson()` writes to temp file then renames. Supports backup rotation (`.bak1`, `.bak2`). Always use this for JSON persistence, never raw `fs.writeFile`.
- **Server reconciles on startup** — resets all transient feature states (`in_progress`, `interrupted`, `pipeline_*`) to resting states, then resumes interrupted features in background.
- **`requireJsonContentType` middleware** — applied globally to `/api`. Returns 415 for POST/PUT/PATCH without `application/json`. This is CSRF protection.
- **Vitest server aliases resolve to source `.ts` files** — `apps/server/vitest.config.ts` maps `@automaker/utils` to `../../libs/utils/src/index.ts` (not `dist/`). This enables proper mocking of shared packages in tests.
- **No React Hook Form in codebase** — despite project rules mentioning RHF, settings panels use direct Zustand action calls on `onChange`.
- **Provider registry** — `provider-factory.ts` registers providers with priority: claude (0), opencode (3), gemini (4), codex (5), copilot (6), cursor (10). `getProviderForModel()` matches by `canHandleModel()`, falls back to prefix, defaults to `claude`.
- **Agent SDK runs with `permissionMode: 'bypassPermissions'`** — fully autonomous, no tool permission prompts. `resume: sdkSessionId` enables conversation continuity.
- **Three settings levels** — global (`{DATA_DIR}/settings.json`), credentials (`{DATA_DIR}/credentials.json`), per-project (`{projectPath}/.automaker/settings.json`).
- **Error boundary crash loop detection** — `AppErrorBoundary` tracks crash timestamps; 3+ crashes in 30s auto-clears `automaker-ui-cache` localStorage.

## Testing Patterns

**Server test setup** (`apps/server/tests/setup.ts`): sets `NODE_ENV=test`, `DATA_DIR=/tmp/test-data`, calls `vi.clearAllMocks()` in `beforeEach`.

**Path alias in tests**: `import { AgentService } from '@/services/agent-service.js'` (`.js` extension required for NodeNext resolution).

**Mock utilities** (`tests/utils/mocks.ts`): `createMockExpressContext()` (req/res/next), `createMockChildProcess()`, `createMockClaudeQuery()`.

**Service tests** use real temp directories and real `fs` — no mocking of the service itself.

**Module mocking pattern**:

```typescript
vi.mock('@automaker/utils', async (importOriginal) => ({
  ...(await importOriginal()),
  atomicWriteJson: vi.fn(),
  readJsonWithRecovery: vi.fn(),
}));
```

Use `vi.hoisted()` for mock instances that need to exist at module load time.

**Route handler tests** extract handler factories and call directly without mounting Express.

## Import Conventions

Always import from `@automaker/*` packages, never from old relative paths:

```typescript
import type { Feature, ExecuteOptions } from '@automaker/types';
import { createLogger, classifyError } from '@automaker/utils';
import { getFeatureDir, ensureAutomakerDir } from '@automaker/platform';
```

Server uses `@/*` path alias → `./src/*`. UI uses `@/*` → `./src/*`.

## Data Storage

File-based, no database. Per-project in `{projectPath}/.automaker/` (features, context, settings, worktrees, ideation, app_spec.txt). Global in `DATA_DIR` (default `./data`): settings.json, credentials.json, agent-sessions/, .api-key, .sessions.

All path utilities in `@automaker/platform` (`getFeatureDir()`, `getAutomakerDir()`, `getGlobalSettingsPath()`, etc.). All paths validated via `validatePath()` / `isPathAllowed()` from `@automaker/platform` security module.

## Environment Variables

- `ANTHROPIC_API_KEY` — Anthropic API key (or Claude Code CLI auth)
- `PORT` — Server port (default: 3008)
- `DATA_DIR` — Data storage directory (default: ./data)
- `ALLOWED_ROOT_DIRECTORY` — Sandbox file operations to a directory
- `AUTOMAKER_API_KEY` — Optional API key auth for server
- `AUTOMAKER_MOCK_AGENT=true` — Mock agent mode for CI
- `AUTOMAKER_AUTO_LOGIN=true` — Skip login in dev (ignored in production)
- `VITE_HOSTNAME` — Frontend API hostname (default: localhost)
- `AUTOMAKER_DEBUG_RAW_OUTPUT=true` — Save raw stream events to `raw-output.jsonl`

## CI Checks

PRs run: format check (Prettier), package tests, server tests with coverage, E2E tests (Playwright with `AUTOMAKER_MOCK_AGENT=true`), `build:electron:dir`, security audit (`npm audit --audit-level=critical`). Pre-commit hook runs Prettier via lint-staged (no ESLint in pre-commit).

## References

- @README.md — Full feature list, Docker setup, auth setup
- @apps/server/.env.example — All environment variables with defaults
- @docs/ — Architecture guides and developer docs
