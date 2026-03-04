import type { IdeaCategory } from '@automaker/types';

export const CORE_TEMPLATE_FIELDS = [
  {
    key: 'topic',
    label: 'Generate ideas about',
    placeholder: 'e.g., user onboarding, data export...',
    type: 'input' as const,
    suggestions: [
      'authentication',
      'onboarding',
      'dashboard',
      'notifications',
      'search',
      'data export',
      'user profiles',
      'settings',
      'integrations',
      'API endpoints',
      'file uploads',
      'collaboration',
      'payments',
      'analytics',
      'email system',
      'admin panel',
      'permissions',
      'workflow automation',
      'reporting',
      'mobile experience',
    ],
  },
  {
    key: 'focus',
    label: 'Focusing on',
    placeholder: 'e.g., simplicity, performance, mobile...',
    type: 'input' as const,
    suggestions: [
      'simplicity',
      'performance',
      'mobile-first',
      'security',
      'scalability',
      'developer experience',
      'accessibility',
      'offline support',
      'real-time updates',
      'error handling',
      'testing',
      'monitoring',
      'caching',
      'type safety',
      'code reusability',
      'progressive enhancement',
      'internationalization',
      'SEO',
      'data validation',
      'responsive design',
      'dark mode',
      'keyboard navigation',
    ],
  },
  {
    key: 'audience',
    label: 'For users who',
    placeholder: 'e.g., are new to the app, manage large teams...',
    type: 'input' as const,
    suggestions: [
      'are new to the app',
      'manage large teams',
      'work on mobile',
      'need enterprise features',
      'are developers',
      'are non-technical',
      'handle sensitive data',
      'work across time zones',
      'need automation',
      'are power users',
      'have accessibility needs',
      'manage multiple projects',
    ],
  },
];

export const ADDITIONAL_TEMPLATE_FIELDS: typeof CORE_TEMPLATE_FIELDS = [
  {
    key: 'context',
    label: 'Context',
    placeholder: 'Tech stack, business situation, constraints, why you need this now...',
    type: 'input' as const,
    suggestions: [],
  },
  {
    key: 'braindump',
    label: 'Braindump',
    placeholder:
      'Dump raw thoughts, half-baked ideas, rough requirements... the AI will make sense of it all',
    type: 'input' as const,
    suggestions: [],
  },
];

export const TEMPLATE_FIELDS = [...CORE_TEMPLATE_FIELDS, ...ADDITIONAL_TEMPLATE_FIELDS];

export const CATEGORY_OPTIONS: { value: IdeaCategory; label: string }[] = [
  { value: 'feature', label: 'Features' },
  { value: 'ux-ui', label: 'UX/UI' },
  { value: 'dx', label: 'Developer Experience' },
  { value: 'growth', label: 'Growth' },
  { value: 'technical', label: 'Technical' },
  { value: 'security', label: 'Security' },
  { value: 'performance', label: 'Performance' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'analytics', label: 'Analytics' },
];

export type PromptMode = 'freetext' | 'template';

export function assembleTemplatePrompt(fields: Record<string, string>): string {
  const parts: string[] = [];
  if (fields.topic) parts.push(`Generate ideas about ${fields.topic}`);
  if (fields.focus) parts.push(`focusing on ${fields.focus}`);
  if (fields.audience) parts.push(`for users who ${fields.audience}`);

  let prompt = parts.join(', ');
  if (prompt) prompt += '.';

  if (fields.context?.trim()) {
    prompt += `\n\n## Context\n${fields.context.trim()}`;
  }
  if (fields.braindump?.trim()) {
    prompt += `\n\n## Raw Ideas & Notes\n${fields.braindump.trim()}`;
  }

  return prompt;
}

export const ENHANCE_SYSTEM_PROMPTS = {
  refine: `You are a prompt engineering expert. Polish and clarify the following prompt for an AI coding agent. Improve clarity, specificity, and wording while keeping the same scope and length. Return the improved prompt formatted in markdown with clear structure using ## headings and bullet points. Be specific and actionable.`,
  expand: `You are a prompt engineering expert. Expand the following prompt into a comprehensive, well-structured AI agent prompt. Add sections for Goal, Requirements, Constraints, and Acceptance Criteria. Add implementation details and structure it as a well-crafted AI agent prompt with ## headings and bullet points. Be specific and actionable.`,
};

export const SURPRISE_PROMPTS = [
  'What if we completely redesigned the onboarding flow using progressive disclosure?',
  'Generate ideas for reducing the number of clicks to complete the most common user task',
  'What accessibility improvements would make this app usable for screen reader users?',
  'How could we add real-time collaboration features without sacrificing performance?',
  'What micro-interactions would make the UI feel more polished and responsive?',
  'Generate ideas for an offline-first mode that syncs when connectivity returns',
  'How could we add keyboard shortcuts for power users without cluttering the UI?',
  'What notification system would keep users informed without being annoying?',
  'Generate ideas for a command palette that makes every feature discoverable',
  'How could we implement undo/redo across the entire application?',
  'What analytics dashboard would help users understand their usage patterns?',
  'Generate ideas for a theming system that goes beyond just dark mode',
  'How could we add AI-powered search that understands natural language queries?',
  'What onboarding checklist would help new users discover key features?',
  'Generate ideas for bulk operations that save time on repetitive tasks',
  'How could we implement smart defaults that learn from user behavior?',
  'What export/import features would make data portable across tools?',
  'Generate ideas for a plugin or extension system for power users',
  'How could we add contextual help that appears exactly when users need it?',
  'What performance optimizations would make the app feel instant on slow connections?',
  'Generate ideas for a dashboard that surfaces the most relevant information first',
  'How could we implement granular permissions without making the UI complex?',
  'What error recovery flows would prevent users from losing their work?',
  'Generate ideas for integrating with the tools users already use daily',
  'How could we add multi-language support with automatic content translation?',
];

export const PROMPT_MAX_LENGTH = 10000;
