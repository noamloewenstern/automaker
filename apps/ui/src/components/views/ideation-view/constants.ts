import type { IdeaCategory, EnhancePromptIntensity } from '@automaker/types';

// ============================================================================
// Template Field Types & Categories
// ============================================================================

export type TemplateFieldInputType =
  | 'text-chips'
  | 'textarea'
  | 'dropdown'
  | 'radio'
  | 'multicheck';

export interface TemplateFieldDefinition {
  key: string;
  label: string;
  placeholder: string;
  inputType: TemplateFieldInputType;
  description?: string;
  suggestions?: string[];
  options?: { value: string; label: string }[];
}

export interface TemplateFieldCategory {
  id: string;
  label: string;
  description?: string;
  alwaysVisible?: boolean;
  fields: TemplateFieldDefinition[];
}

export const TEMPLATE_CATEGORIES: TemplateFieldCategory[] = [
  {
    id: 'core',
    label: 'Core',
    alwaysVisible: true,
    fields: [
      {
        key: 'topic',
        label: 'Generate ideas about',
        placeholder: 'e.g., user onboarding, data export...',
        inputType: 'text-chips',
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
        inputType: 'text-chips',
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
        inputType: 'text-chips',
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
    ],
  },
  {
    id: 'who-and-why',
    label: 'Who & Why',
    description: 'Understand the people and motivations behind the idea',
    fields: [
      {
        key: 'painPoints',
        label: 'What problems are users facing?',
        placeholder: 'Select common pain points...',
        inputType: 'multicheck',
        options: [
          { value: 'slow-workflows', label: 'Slow workflows' },
          { value: 'data-loss-risk', label: 'Data loss risk' },
          { value: 'poor-visibility', label: 'Poor visibility' },
          { value: 'manual-processes', label: 'Manual processes' },
          { value: 'lack-of-integration', label: 'Lack of integration' },
          { value: 'steep-learning-curve', label: 'Steep learning curve' },
          { value: 'inconsistent-experience', label: 'Inconsistent experience' },
          { value: 'no-mobile-support', label: 'No mobile support' },
        ],
      },
      {
        key: 'successMetrics',
        label: 'How will we measure success?',
        placeholder: 'e.g., reduced time-to-completion...',
        inputType: 'text-chips',
        suggestions: [
          'reduced time-to-completion',
          'higher retention',
          'fewer support tickets',
          'increased adoption',
          'improved NPS',
          'faster onboarding',
        ],
      },
      {
        key: 'userMotivation',
        label: 'What drives the need?',
        placeholder: 'Select primary motivation...',
        inputType: 'dropdown',
        options: [
          { value: 'save-time', label: 'Save time / efficiency' },
          { value: 'meet-compliance', label: 'Meet compliance' },
          { value: 'scale-business', label: 'Scale business' },
          { value: 'improve-collaboration', label: 'Improve collaboration' },
          { value: 'reduce-costs', label: 'Reduce costs' },
          { value: 'competitive-advantage', label: 'Competitive advantage' },
        ],
      },
      {
        key: 'stakeholders',
        label: 'Who else cares?',
        placeholder: 'e.g., product managers, engineers...',
        inputType: 'text-chips',
        suggestions: [
          'product managers',
          'engineers',
          'designers',
          'C-suite',
          'end users',
          'support team',
          'sales',
          'partners',
        ],
      },
    ],
  },
  {
    id: 'context-and-constraints',
    label: 'Context & Constraints',
    description: 'Technical environment and boundaries',
    fields: [
      {
        key: 'context',
        label: 'Context',
        placeholder: 'Tech stack, business situation, constraints, why you need this now...',
        inputType: 'textarea',
      },
      {
        key: 'constraints',
        label: 'Constraints',
        placeholder: 'e.g., no new dependencies, must work offline...',
        inputType: 'text-chips',
        suggestions: [
          'no new dependencies',
          'must work offline',
          'backward compatible',
          'mobile-friendly',
          'under 500 lines of code',
          'no breaking changes',
          'must be accessible (WCAG 2.1)',
          'no external API calls',
        ],
      },
      {
        key: 'techStack',
        label: 'Tech stack involved',
        placeholder: 'Select relevant technologies...',
        inputType: 'multicheck',
        options: [
          { value: 'react', label: 'React' },
          { value: 'nodejs', label: 'Node.js' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'redis', label: 'Redis' },
          { value: 'graphql', label: 'GraphQL' },
          { value: 'rest-api', label: 'REST API' },
          { value: 'websocket', label: 'WebSocket' },
          { value: 'docker', label: 'Docker' },
          { value: 'aws-cloud', label: 'AWS / Cloud' },
        ],
      },
      {
        key: 'integrationPoints',
        label: 'What does this connect to?',
        placeholder: 'e.g., external API, database...',
        inputType: 'text-chips',
        suggestions: [
          'external API',
          'database',
          'auth system',
          'file storage',
          'email service',
          'payment gateway',
          'analytics',
          'CI/CD',
        ],
      },
      {
        key: 'performanceNeeds',
        label: 'Speed/scale expectations',
        placeholder: 'Select performance requirement...',
        inputType: 'dropdown',
        options: [
          { value: 'instant', label: 'Instant (<100ms)' },
          { value: 'fast', label: 'Fast (<500ms)' },
          { value: 'responsive', label: 'Responsive (<2s)' },
          { value: 'batch-ok', label: 'Batch processing OK' },
          { value: 'real-time', label: 'Real-time required' },
        ],
      },
      {
        key: 'edgeCases',
        label: 'What could go wrong?',
        placeholder: 'Describe potential failure scenarios, race conditions, edge cases...',
        inputType: 'textarea',
      },
    ],
  },
  {
    id: 'design-and-experience',
    label: 'Design & Experience',
    description: 'How it should look and feel',
    fields: [
      {
        key: 'interactionStyle',
        label: 'What should the experience feel like?',
        placeholder: 'Select interaction style...',
        inputType: 'radio',
        options: [
          { value: 'minimal-fast', label: 'Minimal & fast' },
          { value: 'guided-forgiving', label: 'Guided & forgiving' },
          { value: 'power-user-dense', label: 'Power-user dense' },
          { value: 'conversational', label: 'Conversational' },
        ],
      },
      {
        key: 'accessibility',
        label: 'Accessibility considerations',
        placeholder: 'Select accessibility requirements...',
        inputType: 'multicheck',
        options: [
          { value: 'screen-reader', label: 'Screen reader support' },
          { value: 'keyboard-nav', label: 'Keyboard navigation' },
          { value: 'color-contrast', label: 'Color contrast' },
          { value: 'reduced-motion', label: 'Reduced motion' },
          { value: 'touch-targets', label: 'Touch targets' },
          { value: 'focus-management', label: 'Focus management' },
        ],
      },
      {
        key: 'errorHandling',
        label: 'How should failures behave?',
        placeholder: 'Select error handling strategy...',
        inputType: 'dropdown',
        options: [
          { value: 'silent-retry', label: 'Silent retry' },
          { value: 'inline-error', label: 'Inline error message' },
          { value: 'toast', label: 'Toast notification' },
          { value: 'error-page', label: 'Full error page' },
          { value: 'graceful-degradation', label: 'Graceful degradation' },
        ],
      },
      {
        key: 'progressiveDisclosure',
        label: "What's shown first vs discovered later?",
        placeholder: 'Describe the information hierarchy and progressive disclosure strategy...',
        inputType: 'textarea',
      },
    ],
  },
  {
    id: 'output-and-delivery',
    label: 'Output & Delivery',
    description: 'Shape the final result',
    fields: [
      {
        key: 'outputFormat',
        label: 'Output Format',
        placeholder: 'e.g., bullet list with effort estimates, user stories format...',
        inputType: 'text-chips',
        suggestions: [
          'bullet list',
          'numbered list with effort estimates',
          'user stories format',
          'pros/cons table',
          'priority-ranked list',
          'grouped by category',
          'actionable tasks with acceptance criteria',
        ],
      },
      {
        key: 'braindump',
        label: 'Braindump',
        placeholder:
          'Dump raw thoughts, half-baked ideas, rough requirements... the AI will make sense of it all',
        inputType: 'textarea',
      },
      {
        key: 'priorityLevel',
        label: 'How urgent?',
        placeholder: 'Select priority level...',
        inputType: 'radio',
        options: [
          { value: 'nice-to-have', label: 'Nice-to-have' },
          { value: 'should-have', label: 'Should-have' },
          { value: 'must-have', label: 'Must-have' },
          { value: 'critical', label: 'Critical / blocking' },
        ],
      },
      {
        key: 'scopeBoundary',
        label: "What's explicitly NOT included?",
        placeholder: 'Define scope boundaries to keep the idea focused...',
        inputType: 'textarea',
      },
      {
        key: 'acceptanceCriteria',
        label: 'When is this done?',
        placeholder: 'Describe concrete conditions for completion...',
        inputType: 'textarea',
      },
      {
        key: 'examplesInspiration',
        label: 'Show me something similar',
        placeholder: 'e.g., similar feature in competitor, internal pattern to follow...',
        inputType: 'text-chips',
        suggestions: [
          'similar feature in competitor',
          'internal pattern to follow',
          'design reference',
          'existing component to extend',
        ],
      },
    ],
  },
];

export const TEMPLATE_FIELDS = TEMPLATE_CATEGORIES.flatMap((c) => c.fields);

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
  // Build natural-language sentence from core fields
  const parts: string[] = [];
  if (fields.topic) parts.push(`Generate ideas about ${fields.topic}`);
  if (fields.focus) parts.push(`focusing on ${fields.focus}`);
  if (fields.audience) parts.push(`for users who ${fields.audience}`);

  let prompt = parts.join(', ');
  if (prompt) prompt += '.';

  // Append non-core fields grouped by category
  for (const category of TEMPLATE_CATEGORIES) {
    if (category.alwaysVisible) continue;

    const categoryLines: string[] = [];
    for (const field of category.fields) {
      const value = fields[field.key]?.trim();
      if (!value) continue;

      // Format multicheck values nicely
      const displayValue =
        field.inputType === 'multicheck'
          ? value
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean)
              .join(', ')
          : field.inputType === 'dropdown' || field.inputType === 'radio'
            ? (field.options?.find((o) => o.value === value)?.label ?? value)
            : value;

      categoryLines.push(`- **${field.label}**: ${displayValue}`);
    }

    if (categoryLines.length > 0) {
      prompt += `\n\n## ${category.label}\n${categoryLines.join('\n')}`;
    }
  }

  return prompt;
}

// ============================================================================
// Enhanced System Prompts
// ============================================================================

export const ENHANCE_SYSTEM_PROMPTS: Record<EnhancePromptIntensity, string> = {
  refine: `You are a senior prompt engineer specializing in AI coding agents.

<task>
Polish and clarify the user's prompt. Improve clarity, specificity, and wording while preserving the original scope and intent.
</task>

<process>
1. Identify the core intent and scope of the prompt
2. Add an action verb if missing (Generate, Create, Design, Analyze, etc.)
3. Replace vague language with concrete technical terms
4. Add specificity where the prompt is ambiguous
5. Ensure the prompt specifies what "good output" looks like
</process>

<rules>
- Keep approximately the same length — do NOT expand scope
- Preserve the user's voice and terminology
- Add concrete details only where the original is vague
- Format with ## headings and bullet points for clarity
- Every bullet should be actionable, not descriptive
</rules>

Return ONLY the improved prompt in markdown. No explanations or commentary.`,

  expand: `You are a senior prompt engineer specializing in AI coding agents.

<task>
Expand the user's prompt into a comprehensive, well-structured specification that an AI coding agent can implement directly.
</task>

<process>
Think step by step:
1. What is the core goal?
2. What are the functional requirements?
3. What technical approach makes sense?
4. What constraints should be explicit?
5. How will we know it's done?
</process>

<output_format>
Structure the expanded prompt with these sections:

## Goal
One clear sentence describing the desired outcome.

## Requirements
- Functional requirements as bullet points
- Each requirement should be testable

## Technical Approach
- Suggested implementation strategy
- Key components/files to create or modify
- Data flow or architecture notes

## Constraints
- What to avoid
- Performance/size limits
- Compatibility requirements

## Acceptance Criteria
- Concrete, verifiable conditions for "done"
- Include edge cases to handle
</output_format>

<rules>
- Be specific and actionable — this goes directly to an AI coding agent
- Ground suggestions in the project context when available
- Don't add unnecessary complexity — match the scope of the original prompt
- Every section should add value; omit sections that don't apply
</rules>

Return ONLY the expanded prompt in markdown. No explanations or commentary.`,

  structure: `You are a senior prompt engineer specializing in AI coding agents.

<task>
Reorganize the user's existing prompt content into a well-structured format. Do NOT add new requirements or change the scope — only improve the organization and clarity of what's already there.
</task>

<process>
1. Read the entire prompt to understand all requirements mentioned
2. Group related requirements together
3. Add clear section headings
4. Convert prose into actionable bullet points
5. Add a role definition if missing
6. Ensure instructions are in logical order (context first, then requirements, then constraints)
</process>

<rules>
- Preserve ALL original content and requirements — nothing should be lost
- Do NOT add new features, requirements, or scope
- Do NOT remove any requirements, even if they seem redundant
- Convert vague statements into clearer phrasing using the user's own words
- Use ## headings, bullet points, and numbered lists for structure
- Add chain-of-thought instructions (e.g., "Think step by step about...") where complex reasoning is needed
</rules>

Return ONLY the restructured prompt in markdown. No explanations or commentary.`,
};

// ============================================================================
// Prompt Quality Dimensions
// ============================================================================

export interface PromptQualityDimension {
  key: string;
  label: string;
  check: (text: string) => boolean;
  tip: string;
  insertSnippet: string;
}

export const PROMPT_QUALITY_DIMENSIONS: PromptQualityDimension[] = [
  {
    key: 'actionable',
    label: 'Actionable',
    check: (text) =>
      /^(generate|create|design|build|implement|add|develop|analyze|improve|refactor|fix|write|set up|configure|migrate|optimize|review|test)\b/i.test(
        text.trim()
      ),
    tip: 'Start with a clear action verb (Generate, Create, Design...)',
    insertSnippet: '',
  },
  {
    key: 'specificity',
    label: 'Specific',
    check: (text) =>
      /\b(api|component|database|auth|endpoint|route|hook|service|modal|form|table|button|page|dashboard|function|module|class|schema|query|mutation|middleware|controller|model|view|template|config|plugin|provider|adapter)\b/i.test(
        text
      ),
    tip: 'Add specific details: component names, endpoints, behaviors',
    insertSnippet: '\n\n## Specifics\n- Component/file: \n- Behavior: ',
  },
  {
    key: 'context',
    label: 'Context',
    check: (text) =>
      /\b(because|since|currently|existing|right now|the problem is|we need|users? (are|want|need)|background|situation)\b/i.test(
        text
      ) || /##\s*context/i.test(text),
    tip: 'Explain why you need this — background or motivation',
    insertSnippet: '\n\n## Context\nCurrently, ',
  },
  {
    key: 'outputFormat',
    label: 'Output Format',
    check: (text) =>
      /\b(format|output|return|produce|generate .* (as|in|with)|structured as|bullet|list|table|markdown|json|yaml|grouped by)\b/i.test(
        text
      ) || /##\s*(output|format|expected)/i.test(text),
    tip: 'Specify the desired output format (list, table, grouped...)',
    insertSnippet: '\n\n## Expected Output\nReturn results as ',
  },
  {
    key: 'constraints',
    label: 'Constraints',
    check: (text) =>
      /\b(must not|should not|don't|avoid|limit|maximum|minimum|no more than|at most|at least|without|constraint|restriction|exclude|only)\b/i.test(
        text
      ) || /##\s*constraints/i.test(text),
    tip: 'Add constraints: what to avoid, limits, or boundaries',
    insertSnippet: '\n\n## Constraints\n- Must not ',
  },
  {
    key: 'examples',
    label: 'Examples',
    check: (text) =>
      /\b(example|e\.g\.|for instance|such as|like this|sample|demo|illustration)\b/i.test(text) ||
      /##\s*example/i.test(text),
    tip: 'Include 1-2 examples of desired output',
    insertSnippet: '\n\n## Example\nFor example: ',
  },
];

// ============================================================================
// Prompt Patterns Library
// ============================================================================

export interface PromptPattern {
  id: string;
  label: string;
  description: string;
  mode: PromptMode;
  prompt: string;
  templateFields?: Record<string, string>;
}

export const PROMPT_PATTERNS: PromptPattern[] = [
  {
    id: 'surprise',
    label: 'Surprise me',
    description: 'Random creative prompt',
    mode: 'freetext',
    prompt: '', // filled at runtime from SURPRISE_PROMPTS
  },
  {
    id: 'feature-exploration',
    label: 'Feature Exploration',
    description: 'Systematic improvement analysis',
    mode: 'freetext',
    prompt: `Analyze [AREA OF THE APP] and generate improvement ideas using this framework:

## Current State
Describe what [AREA OF THE APP] does today and its key user flows.

## Analysis Dimensions
For each dimension, generate 2-3 concrete ideas:
- **Usability**: How can the interaction be simpler or more intuitive?
- **Performance**: What operations could be faster or more efficient?
- **Reliability**: What edge cases or failure modes need handling?
- **Extensibility**: How could this be made more flexible for future needs?

## Constraints
- Ideas must be implementable within the existing architecture
- Prioritize changes that benefit the most users

## Expected Output
Return ideas as a priority-ranked list with effort estimates (small/medium/large).`,
  },
  {
    id: 'problem-solution',
    label: 'Problem-Solution',
    description: 'Start from user problem, generate solutions',
    mode: 'freetext',
    prompt: `Users are struggling with [DESCRIBE THE PROBLEM].

## Problem Details
- Who is affected: [USER TYPE]
- Current workaround: [HOW THEY COPE TODAY]
- Impact: [WHAT HAPPENS WHEN THIS ISN'T SOLVED]

## Generate Solutions
Think step by step:
1. What is the root cause of this problem?
2. What are 3 different approaches to solve it?
3. For each approach, what are the trade-offs?

## Constraints
- Solution must not break existing workflows
- Prefer minimal UI changes

## Expected Output
For each solution: title, description, pros, cons, and estimated effort.`,
  },
  {
    id: 'user-journey',
    label: 'User Journey Mapping',
    description: 'Map a flow and identify friction points',
    mode: 'freetext',
    prompt: `Map the user journey for [DESCRIBE THE FLOW] and identify opportunities for improvement.

## Journey Steps
Trace the complete flow from start to finish:
1. Entry point: How does the user start this flow?
2. Key steps: What actions does the user take?
3. Decision points: Where does the user make choices?
4. Completion: How does the user know they're done?

## For Each Step, Analyze
- **Friction**: What slows the user down or causes confusion?
- **Delight**: What could make this step feel effortless?
- **Drop-off risk**: Where might users abandon the flow?

## Expected Output
A numbered list of journey steps, each with identified friction points and concrete improvement ideas.`,
  },
  {
    id: 'technical-audit',
    label: 'Technical Audit',
    description: 'Analyze a system area for issues',
    mode: 'freetext',
    prompt: `Perform a technical audit of [SYSTEM AREA] and generate ideas for improvements.

## Audit Focus Areas
- **Code quality**: Duplication, complexity, naming
- **Error handling**: Missing error cases, unhelpful messages
- **Performance**: N+1 queries, unnecessary re-renders, bundle size
- **Security**: Input validation, auth checks, data exposure
- **Testing**: Untested paths, flaky tests, missing edge cases

## Context
- Tech stack: [YOUR TECH STACK]
- Scale: [NUMBER OF USERS / DATA VOLUME]

## Constraints
- Focus on actionable improvements, not theoretical best practices
- Prioritize by risk (high-risk issues first)

## Expected Output
Grouped by focus area, each finding with: description, severity (critical/high/medium/low), and suggested fix.`,
  },
  {
    id: 'competitive-analysis',
    label: 'Competitive Analysis',
    description: 'Generate ideas inspired by competitors',
    mode: 'freetext',
    prompt: `Generate feature ideas for [YOUR PRODUCT AREA] inspired by how [COMPETITOR OR SIMILAR PRODUCT] solves similar problems.

## Analysis Framework
For each competitor feature worth considering:
1. What problem does it solve for users?
2. How does their implementation work?
3. How could we adapt this for our context?
4. What could we do differently or better?

## Constraints
- Don't copy — adapt and improve
- Ideas must fit our existing architecture
- Focus on features that serve our specific user base

## Expected Output
A list of ideas, each with: inspiration source, adapted concept, implementation approach, and estimated effort.`,
  },
  {
    id: 'quick-wins',
    label: 'Quick Wins',
    description: 'Low-effort, high-impact improvements',
    mode: 'template',
    prompt: '',
    templateFields: {
      topic: 'quick wins and low-hanging fruit improvements',
      focus: 'simplicity, developer experience',
      audience: 'are power users',
      constraints: 'under 2 hours of work each, no new dependencies, no breaking changes',
      outputFormat: 'priority-ranked list with effort estimates',
    },
  },
];

// ============================================================================
// Surprise Prompts (used by the Surprise me pattern)
// ============================================================================

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
