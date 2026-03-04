import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useUICacheStore } from '@/store/ui-cache-store';
import { useAuthStore } from '@/store/auth-store';
import { createLogger } from '@automaker/utils/logger';
import {
  parseLocalStorageSettings,
  hydrateStoreFromSettings,
} from '@/hooks/use-settings-migration';
import type { GlobalSettings } from '@automaker/types';

const logger = createLogger('ProjectRestore');

/**
 * Self-heals currentProject when it's lost (e.g., Vite HMR store reset,
 * server restart triggering logout cascade).
 *
 * Restores from UI cache (localStorage) or project history.
 * Falls back to re-hydrating the entire store from localStorage settings cache
 * when the store is empty (e.g., after a logout cascade wiped projects).
 *
 * No-op when currentProject is already set.
 */
export function useProjectRestore() {
  const currentProject = useAppStore((s) => s.currentProject);
  const projects = useAppStore((s) => s.projects);

  useEffect(() => {
    if (currentProject) return;

    const { projectHistory, setCurrentProject } = useAppStore.getState();
    const { cachedProjectId } = useUICacheStore.getState();
    const targetId = cachedProjectId ?? projectHistory?.[0] ?? null;

    // If store has projects, try to find and restore
    if (projects?.length && targetId) {
      const project = projects.find((p) => p.id === targetId);
      if (project) {
        logger.info('[PROJECT_RESTORE] Restoring from store:', project.name);
        setCurrentProject(project);
        ensureAuthState();
        return;
      }
    }

    // Fallback: store is empty (e.g. after logout cascade / HMR reset)
    // Read directly from localStorage cache and re-hydrate
    const cached = parseLocalStorageSettings();
    if (cached?.projects?.length) {
      logger.info('[PROJECT_RESTORE] Store empty, re-hydrating from localStorage cache');
      hydrateStoreFromSettings(cached as GlobalSettings);

      // hydrateStoreFromSettings sets currentProject from cached.currentProjectId.
      // If that didn't work, try cachedProjectId from UI cache store.
      const restored = useAppStore.getState().currentProject;
      if (!restored && targetId) {
        const project = useAppStore.getState().projects.find((p) => p.id === targetId);
        if (project) {
          logger.info('[PROJECT_RESTORE] Restored via cachedProjectId:', project.name);
          setCurrentProject(project);
        }
      }
      ensureAuthState();
    }
  }, [currentProject, projects]);
}

/**
 * After restoring project state, ensure auth flags are consistent.
 * If we have valid cached settings the session is likely still valid —
 * the server just restarted. Re-mark as authenticated to prevent the
 * routing effect from redirecting to /logged-out.
 */
function ensureAuthState() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    logger.info('[PROJECT_RESTORE] Re-setting auth state after restore');
    useAuthStore.getState().setAuthState({
      isAuthenticated: true,
      authChecked: true,
      settingsLoaded: true,
    });
  }
}
