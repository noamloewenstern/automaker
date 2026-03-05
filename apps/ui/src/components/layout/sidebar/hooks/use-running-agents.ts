import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createLogger } from '@automaker/utils/logger';
import { getElectronAPI } from '@/lib/electron';
import { useRunningAgentsCount } from '@/hooks/queries/use-running-agents';
import { queryKeys } from '@/lib/query-keys';

const logger = createLogger('RunningAgents');

export function useRunningAgents() {
  const queryClient = useQueryClient();
  const { data: runningAgentsCount } = useRunningAgentsCount();

  // Subscribe to auto-mode events for faster updates
  useEffect(() => {
    const api = getElectronAPI();
    if (!api.autoMode) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runningAgents.all() });
    };

    const unsubscribe = api.autoMode.onEvent((event) => {
      logger.debug('Auto mode event for running agents hook', { type: event.type });
      if (
        event.type === 'auto_mode_feature_complete' ||
        event.type === 'auto_mode_error' ||
        event.type === 'auto_mode_feature_start'
      ) {
        invalidate();
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  // Subscribe to backlog plan events
  useEffect(() => {
    const api = getElectronAPI();
    if (!api.backlogPlan) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runningAgents.all() });
    };

    const unsubscribe = api.backlogPlan.onEvent(() => {
      invalidate();
    });
    return () => unsubscribe();
  }, [queryClient]);

  // Subscribe to spec regeneration events
  useEffect(() => {
    const api = getElectronAPI();
    if (!api.specRegeneration) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runningAgents.all() });
    };

    const unsubscribe = api.specRegeneration.onEvent((event) => {
      logger.debug('Spec regeneration event for running agents hook', { type: event.type });
      if (event.type === 'spec_regeneration_complete' || event.type === 'spec_regeneration_error') {
        invalidate();
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  // Subscribe to ideation suggestion events
  useEffect(() => {
    const api = getElectronAPI();
    if (!api.ideation) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runningAgents.all() });
    };

    const unsubSuggestions = api.ideation.onSuggestionsEvent((event: unknown) => {
      const ev = event as { type?: string };
      logger.debug('Ideation suggestions event for running agents hook', { type: ev.type });
      if (ev.type === 'started' || ev.type === 'complete' || ev.type === 'error') {
        invalidate();
      }
    });

    const unsubAnalysis = api.ideation.onAnalysisEvent((event) => {
      const ev = event as { type?: string };
      logger.debug('Ideation analysis event for running agents hook', { type: ev.type });
      if (
        ev.type === 'ideation:analysis-started' ||
        ev.type === 'ideation:analysis-complete' ||
        ev.type === 'ideation:analysis-error'
      ) {
        invalidate();
      }
    });

    return () => {
      unsubSuggestions();
      unsubAnalysis();
    };
  }, [queryClient]);

  return {
    runningAgentsCount: runningAgentsCount ?? 0,
  };
}
