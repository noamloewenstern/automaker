import type { IdeaCategory, IdeationPrompt, PromptCategory } from '@automaker/types';

export const IDEATION_CATEGORIES: PromptCategory[] = [
  {
    id: 'feature',
    name: 'Features',
    icon: 'Zap',
    description: 'New capabilities and functionality',
  },
  {
    id: 'ux-ui',
    name: 'UX/UI',
    icon: 'Palette',
    description: 'Design and user experience improvements',
  },
  {
    id: 'dx',
    name: 'Developer Experience',
    icon: 'Code',
    description: 'Developer tooling and workflows',
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: 'TrendingUp',
    description: 'User engagement and retention',
  },
  {
    id: 'technical',
    name: 'Technical',
    icon: 'Cpu',
    description: 'Architecture and infrastructure',
  },
  {
    id: 'security',
    name: 'Security',
    icon: 'Shield',
    description: 'Security improvements and vulnerability fixes',
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: 'Gauge',
    description: 'Performance optimization and speed improvements',
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    icon: 'Accessibility',
    description: 'Accessibility features and inclusive design',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: 'BarChart3',
    description: 'Analytics, monitoring, and insights features',
  },
  {
    id: 'reliability',
    name: 'Reliability',
    icon: 'HeartPulse',
    description: 'SRE practices, fault tolerance, and graceful degradation',
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: 'Container',
    description: 'Deployment, infrastructure, and operational excellence',
  },
  {
    id: 'data',
    name: 'Data Management',
    icon: 'Database',
    description: 'Data governance, lifecycle, and quality',
  },
  {
    id: 'testing',
    name: 'Testing Strategy',
    icon: 'FlaskConical',
    description: 'Test architecture, coverage strategy, and quality gates',
  },
];

export const IDEATION_CATEGORY_DESCRIPTIONS: Record<IdeaCategory, string> = {
  feature: 'New features and capabilities that add value for users',
  'ux-ui': 'User interface and user experience improvements',
  dx: 'Developer experience and tooling improvements',
  growth: 'User acquisition, engagement, and retention',
  technical: 'Architecture, performance, and infrastructure',
  security: 'Security improvements and vulnerability fixes',
  performance: 'Performance optimization and speed improvements',
  accessibility: 'Accessibility features and inclusive design',
  analytics: 'Analytics, monitoring, and insights features',
  reliability: 'SRE practices, fault tolerance, and graceful degradation',
  devops: 'Deployment, infrastructure, and operational excellence',
  data: 'Data governance, lifecycle, and quality',
  testing: 'Test architecture, coverage strategy, and quality gates',
};

export const IDEATION_CATEGORY_TYPE_MAPPING: Record<IdeaCategory, string> = {
  feature: 'ui',
  'ux-ui': 'enhancement',
  dx: 'chore',
  growth: 'feature',
  technical: 'refactor',
  security: 'bug',
  performance: 'enhancement',
  accessibility: 'enhancement',
  analytics: 'feature',
  reliability: 'refactor',
  devops: 'chore',
  data: 'refactor',
  testing: 'chore',
};

export const IDEATION_PROMPTS: IdeationPrompt[] = [
  // Feature prompts
  {
    id: 'feature-missing',
    category: 'feature',
    title: 'Missing Features',
    description: 'Discover features users might expect',
    prompt:
      "Based on the project context provided, identify features that users of similar applications typically expect but might be missing. Consider the app's domain, target users, and common patterns in similar products.",
  },
  {
    id: 'feature-automation',
    category: 'feature',
    title: 'Automation Opportunities',
    description: 'Find manual processes that could be automated',
    prompt:
      'Based on the project context, identify manual processes or repetitive tasks that could be automated. Look for patterns where users might be doing things repeatedly that software could handle.',
  },
  {
    id: 'feature-integrations',
    category: 'feature',
    title: 'Integration Ideas',
    description: 'Identify valuable third-party integrations',
    prompt:
      "Based on the project context, what third-party services or APIs would provide value if integrated? Consider the app's domain and what complementary services users might need.",
  },
  {
    id: 'feature-workflow',
    category: 'feature',
    title: 'Workflow Improvements',
    description: 'Streamline user workflows',
    prompt:
      'Based on the project context, analyze the user workflows. What steps could be combined, eliminated, or automated? Where are users likely spending too much time on repetitive tasks?',
  },
  {
    id: 'feature-export-import',
    category: 'feature',
    title: 'Data Export/Import',
    description: 'Bulk data portability and migration tools',
    prompt:
      'Based on the project context, identify opportunities for data export and import features. What data would users want to export (CSV, JSON, PDF)? What migration or bulk import capabilities would reduce onboarding friction? Consider data portability regulations and interoperability with competing products.',
  },
  {
    id: 'feature-offline',
    category: 'feature',
    title: 'Offline Support',
    description: 'Progressive web app and offline-first patterns',
    prompt:
      'Based on the project context, evaluate offline support opportunities. Which features would benefit from offline-first patterns? Consider service workers, local storage strategies, conflict resolution for sync, and progressive web app capabilities that would improve reliability.',
  },
  {
    id: 'feature-batch-operations',
    category: 'feature',
    title: 'Batch Operations',
    description: 'Multi-select actions and bulk edits',
    prompt:
      'Based on the project context, identify where batch operations would save users significant time. What multi-select actions, bulk edits, or mass operations are missing? Consider common repetitive tasks that users perform one-by-one that could be batched.',
  },
  {
    id: 'feature-undo-redo',
    category: 'feature',
    title: 'Undo/Redo System',
    description: 'Action history and reversible operations',
    prompt:
      'Based on the project context, evaluate where an undo/redo system would improve user confidence. What destructive actions lack reversibility? Consider implementing command patterns, action history stacks, and soft-delete strategies that let users recover from mistakes.',
  },
  {
    id: 'feature-notifications',
    category: 'feature',
    title: 'Notification System',
    description: 'In-app alerts, digests, and webhooks',
    prompt:
      'Based on the project context, design a notification strategy. What events should trigger notifications? Consider in-app notifications, email digests, push notifications, and webhook integrations. How should users control notification preferences and frequency?',
  },
  {
    id: 'feature-search',
    category: 'feature',
    title: 'Search & Filtering',
    description: 'Full-text search and advanced filters',
    prompt:
      'Based on the project context, evaluate search and filtering capabilities. Where would full-text search, faceted filters, or saved search presets improve discoverability? Consider search relevance ranking, typeahead suggestions, and filter combinations users would need.',
  },
  {
    id: 'feature-templates',
    category: 'feature',
    title: 'Templating System',
    description: 'Reusable presets and starter configurations',
    prompt:
      'Based on the project context, identify opportunities for templates and presets. What configurations or setups do users recreate repeatedly? Consider starter templates, user-defined presets, and shareable configurations that reduce repetitive setup work.',
  },
  {
    id: 'feature-multi-tenancy',
    category: 'feature',
    title: 'Multi-tenancy',
    description: 'Workspace isolation and organization hierarchies',
    prompt:
      'Based on the project context, evaluate multi-tenancy needs. Would the application benefit from workspace isolation, team hierarchies, or organization-level features? Consider data segregation, role-based access across tenants, and billing implications.',
  },
  {
    id: 'feature-versioning',
    category: 'feature',
    title: 'Content Versioning',
    description: 'Track and restore previous content states',
    prompt:
      'Based on the project context, analyze where users edit or create content and need revision history. Consider document versioning, diff views, branching drafts, and rollback capabilities.',
  },
  {
    id: 'feature-delegation',
    category: 'feature',
    title: 'Role-Based Delegation',
    description: 'Assign tasks and transfer ownership',
    prompt:
      'Based on the project context, identify workflows where one user needs to hand off work to another. Consider approval chains, delegation rules, task assignment with deadlines, and audit trails for handoffs.',
  },
  {
    id: 'feature-smart-defaults',
    category: 'feature',
    title: 'Smart Defaults',
    description: 'Learn from behavior to preset values',
    prompt:
      'Based on the project context, find forms and configuration screens where the system could predict user intent. Consider per-user history, team-level defaults, recently-used values, and contextual suggestions.',
  },
  {
    id: 'feature-webhooks',
    category: 'feature',
    title: 'Webhook System',
    description: 'Emit events to external consumers',
    prompt:
      'Based on the project context, evaluate which internal events external systems need to react to. Consider webhook registration UI, payload schemas, retry policies, delivery logs, and signature verification.',
  },
  {
    id: 'feature-audit-trail',
    category: 'feature',
    title: 'Activity Feed',
    description: 'Chronological log of user and system actions',
    prompt:
      'Based on the project context, identify where users need to understand "what happened and why." Consider filterable activity streams, entity-level history, team-wide feeds, and export for compliance.',
  },
  {
    id: 'feature-scheduled-actions',
    category: 'feature',
    title: 'Scheduled Actions',
    description: 'Time-based triggers and recurring operations',
    prompt:
      'Based on the project context, find operations users wish they could schedule. Consider cron-like scheduling UI, recurring tasks, timezone handling, missed-execution recovery, and schedule conflict detection.',
  },
  {
    id: 'feature-import-wizard',
    category: 'feature',
    title: 'Import Wizard',
    description: 'Step-by-step guided data ingestion',
    prompt:
      'Based on the project context, analyze onboarding friction from initial data loading. Consider multi-format parsers (CSV/JSON/Excel), column mapping UI, validation preview, error correction before commit, and progress tracking.',
  },
  {
    id: 'feature-custom-fields',
    category: 'feature',
    title: 'Custom Fields',
    description: 'User-defined metadata extensions',
    prompt:
      'Based on the project context, evaluate where different users need different data on the same entity. Consider typed custom fields (text/number/date/dropdown), field visibility rules, search/filter on custom fields, and migration when fields change.',
  },
  {
    id: 'feature-keyboard-shortcuts',
    category: 'feature',
    title: 'Keyboard Shortcuts',
    description: 'Power-user accelerators for common actions',
    prompt:
      'Based on the project context, identify the top 20 most-clicked actions and evaluate keyboard shortcut coverage. Consider discoverability (cheat sheet overlay), customization, conflict detection, and context-sensitive shortcuts.',
  },
  {
    id: 'feature-real-time-collab',
    category: 'feature',
    title: 'Real-time Collaboration',
    description: 'Concurrent editing and presence awareness',
    prompt:
      'Based on the project context, evaluate where multiple users interact with the same data simultaneously. Consider presence indicators, conflict resolution (OT/CRDT), live cursors, optimistic updates, and collaboration-aware locking.',
  },

  // UX/UI prompts
  {
    id: 'ux-friction',
    category: 'ux-ui',
    title: 'Friction Points',
    description: 'Identify where users might get stuck',
    prompt:
      'Based on the project context, identify potential user friction points. Where might users get confused, stuck, or frustrated? Consider form submissions, navigation, error states, and complex interactions.',
  },
  {
    id: 'ux-empty-states',
    category: 'ux-ui',
    title: 'Empty States',
    description: 'Improve empty state experiences',
    prompt:
      "Based on the project context, identify empty states that could be improved. How can we guide users when there's no content? Consider onboarding, helpful prompts, and sample data.",
  },
  {
    id: 'ux-accessibility',
    category: 'ux-ui',
    title: 'Accessibility Improvements',
    description: 'Enhance accessibility and inclusivity',
    prompt:
      'Based on the project context, suggest accessibility improvements. Consider keyboard navigation, screen reader support, color contrast, focus states, and ARIA labels. What specific improvements would make this more accessible?',
  },
  {
    id: 'ux-mobile',
    category: 'ux-ui',
    title: 'Mobile Experience',
    description: 'Optimize for mobile users',
    prompt:
      'Based on the project context, suggest improvements for the mobile user experience. Consider touch targets, responsive layouts, and mobile-specific interactions.',
  },
  {
    id: 'ux-feedback',
    category: 'ux-ui',
    title: 'User Feedback',
    description: 'Improve feedback and status indicators',
    prompt:
      'Based on the project context, analyze how the application communicates with users. Where are loading states, success messages, or error handling missing or unclear? What feedback would help users understand what is happening?',
  },
  {
    id: 'ux-progressive-disclosure',
    category: 'ux-ui',
    title: 'Progressive Disclosure',
    description: 'Manage complexity with layered interfaces',
    prompt:
      'Based on the project context, identify where progressive disclosure could reduce cognitive load. What advanced features should be hidden behind "Advanced" toggles or secondary panels? Consider beginner vs power-user modes, contextual feature reveal, and information hierarchy.',
  },
  {
    id: 'ux-micro-interactions',
    category: 'ux-ui',
    title: 'Micro-interactions',
    description: 'Animations, transitions, and delightful moments',
    prompt:
      'Based on the project context, identify opportunities for meaningful micro-interactions. Where would subtle animations, transitions, or visual feedback make the interface feel more polished and responsive? Consider hover states, drag feedback, success celebrations, and skeleton loading.',
  },
  {
    id: 'ux-error-recovery',
    category: 'ux-ui',
    title: 'Error Recovery',
    description: 'Graceful degradation and auto-save',
    prompt:
      'Based on the project context, analyze error recovery patterns. Where could users lose work due to crashes, network failures, or accidental navigation? Consider auto-save, draft recovery, graceful degradation when services are unavailable, and retry mechanisms.',
  },
  {
    id: 'ux-contextual-help',
    category: 'ux-ui',
    title: 'Contextual Help',
    description: 'Tooltips, guided tours, and inline docs',
    prompt:
      'Based on the project context, identify where contextual help would reduce user confusion. What features need inline documentation, tooltips, or guided tours? Consider first-time user experiences, complex configuration screens, and jargon that needs explanation.',
  },
  {
    id: 'ux-responsive-tables',
    category: 'ux-ui',
    title: 'Responsive Tables',
    description: 'Data-heavy views on all screen sizes',
    prompt:
      'Based on the project context, review data-heavy views and table layouts. How do they behave on smaller screens? Consider column prioritization, horizontal scrolling, card-based alternatives, and responsive patterns for data tables that maintain usability across devices.',
  },
  {
    id: 'ux-theming',
    category: 'ux-ui',
    title: 'Dark Mode & Theming',
    description: 'User-customizable visual preferences',
    prompt:
      'Based on the project context, evaluate theming and visual customization. Does the app respect system dark/light mode preferences? Consider user-selectable themes, high-contrast modes, custom accent colors, and consistent design token usage across all components.',
  },
  {
    id: 'ux-command-palette',
    category: 'ux-ui',
    title: 'Command Palette',
    description: 'Keyboard-driven power-user navigation',
    prompt:
      'Based on the project context, evaluate whether a command palette (Cmd+K style) would benefit power users. What actions, navigation targets, and searches should be accessible from a unified command interface? Consider fuzzy matching, recent actions, and contextual commands.',
  },
  {
    id: 'ux-onboarding-checklist',
    category: 'ux-ui',
    title: 'Onboarding Checklist',
    description: 'Step-by-step setup completion tracker',
    prompt:
      'Based on the project context, design a post-signup checklist that guides users to their first value. Consider progress indicators, skip-ability, contextual nudges, and celebration on completion.',
  },
  {
    id: 'ux-skeleton-loading',
    category: 'ux-ui',
    title: 'Skeleton Loading',
    description: 'Perceived performance with content placeholders',
    prompt:
      'Based on the project context, identify views that show raw spinners or blank screens. Consider skeleton shapes matching real content, shimmer animations, progressive content reveal, and smooth transitions.',
  },
  {
    id: 'ux-bulk-selection',
    category: 'ux-ui',
    title: 'Bulk Selection UX',
    description: 'Multi-item selection and bulk action patterns',
    prompt:
      'Based on the project context, review list and table views for multi-select needs. Consider shift-click range select, select-all with pagination, floating action bars, and feedback for selected item count.',
  },
  {
    id: 'ux-confirmation-dialogs',
    category: 'ux-ui',
    title: 'Confirmation Dialogs',
    description: 'Prevent accidental destructive actions',
    prompt:
      'Based on the project context, audit destructive actions (delete, overwrite, discard) for proper confirmation. Consider typed-confirmation for high-impact actions, undo as alternative to confirmation, and information shown in the dialog.',
  },
  {
    id: 'ux-breadcrumbs',
    category: 'ux-ui',
    title: 'Navigation Breadcrumbs',
    description: 'Wayfinding and hierarchical context',
    prompt:
      'Based on the project context, evaluate deep page hierarchies that lose user context. Consider breadcrumb trails, back-navigation shortcuts, current-location indicators, and mobile-friendly truncation.',
  },
  {
    id: 'ux-inline-editing',
    category: 'ux-ui',
    title: 'Inline Editing',
    description: 'Edit-in-place without modal context switches',
    prompt:
      'Based on the project context, identify edit flows that force unnecessary page or modal transitions. Consider click-to-edit fields, escape-to-cancel, auto-save on blur, and clear visual editing state.',
  },
  {
    id: 'ux-data-visualization',
    category: 'ux-ui',
    title: 'Data Visualization',
    description: 'Charts and graphs for complex data',
    prompt:
      'Based on the project context, find data-heavy views where tables alone fail to communicate trends. Consider chart type selection, interactive tooltips, responsive sizing, and accessible color palettes.',
  },
  {
    id: 'ux-drag-reordering',
    category: 'ux-ui',
    title: 'Drag Reordering',
    description: 'Direct-manipulation sorting and prioritization',
    prompt:
      'Based on the project context, identify ordered lists users need to rearrange. Consider drag handles, keyboard reorder alternatives, drop-zone indicators, animation smoothness, and persistence of custom order.',
  },
  {
    id: 'ux-multi-step-forms',
    category: 'ux-ui',
    title: 'Multi-Step Forms',
    description: 'Wizard patterns for complex inputs',
    prompt:
      'Based on the project context, find forms with many fields that overwhelm users. Consider step indicators, back/forward navigation, draft auto-save per step, validation per step, and summary review before submission.',
  },
  {
    id: 'ux-notification-center',
    category: 'ux-ui',
    title: 'Notification Center',
    description: 'Centralized notification hub and preferences',
    prompt:
      'Based on the project context, design a unified notification inbox. Consider unread badges, notification grouping, mark-all-read, notification preferences per channel, and quiet hours.',
  },

  // DX prompts
  {
    id: 'dx-documentation',
    category: 'dx',
    title: 'Documentation Gaps',
    description: 'Identify missing documentation',
    prompt:
      'Based on the project context, identify areas that could benefit from better documentation. What would help new developers understand the architecture, APIs, and conventions? Consider inline comments, READMEs, and API docs.',
  },
  {
    id: 'dx-testing',
    category: 'dx',
    title: 'Testing Improvements',
    description: 'Enhance test coverage and quality',
    prompt:
      'Based on the project context, suggest areas that need better test coverage. What types of tests might be missing? Consider unit tests, integration tests, and end-to-end tests.',
  },
  {
    id: 'dx-tooling',
    category: 'dx',
    title: 'Developer Tooling',
    description: 'Improve development workflows',
    prompt:
      'Based on the project context, suggest improvements to development workflows. What improvements would speed up development? Consider build times, hot reload, debugging tools, and developer scripts.',
  },
  {
    id: 'dx-error-handling',
    category: 'dx',
    title: 'Error Handling',
    description: 'Improve error messages and debugging',
    prompt:
      'Based on the project context, analyze error handling. Where are error messages unclear or missing? What would help developers debug issues faster? Consider logging, error boundaries, and stack traces.',
  },
  {
    id: 'dx-ci-cd',
    category: 'dx',
    title: 'CI/CD Pipeline',
    description: 'Build optimization and deployment automation',
    prompt:
      'Based on the project context, evaluate CI/CD pipeline improvements. What build steps could be parallelized or cached? Consider preview deployments for PRs, automated release workflows, build time optimization, and deployment rollback strategies.',
  },
  {
    id: 'dx-code-generation',
    category: 'dx',
    title: 'Code Generation',
    description: 'Scaffolding and boilerplate generators',
    prompt:
      'Based on the project context, identify repetitive code patterns that could be auto-generated. What scaffolding tools, CLI generators, or schema-to-code pipelines would accelerate development? Consider route generators, component scaffolding, and API client generation from specs.',
  },
  {
    id: 'dx-api-versioning',
    category: 'dx',
    title: 'API Versioning',
    description: 'Backward compatibility and deprecation strategy',
    prompt:
      'Based on the project context, review API versioning strategy. How are breaking changes communicated and managed? Consider versioned endpoints, deprecation headers, migration guides, and backward-compatible evolution patterns that minimize client disruption.',
  },
  {
    id: 'dx-local-dev',
    category: 'dx',
    title: 'Local Dev Environment',
    description: 'Docker setup, seed data, and env parity',
    prompt:
      'Based on the project context, evaluate the local development experience. How quickly can a new developer go from clone to running? Consider Docker Compose setups, seed data scripts, environment parity with production, and documentation of local prerequisites.',
  },
  {
    id: 'dx-dependency-management',
    category: 'dx',
    title: 'Dependency Management',
    description: 'Audit automation and upgrade strategies',
    prompt:
      'Based on the project context, review dependency management practices. Are there outdated or vulnerable dependencies? Consider automated audit tools, upgrade strategies (Renovate/Dependabot), lockfile hygiene, and policies for evaluating new dependencies.',
  },
  {
    id: 'dx-observability',
    category: 'dx',
    title: 'Observability',
    description: 'Structured logging and distributed tracing',
    prompt:
      'Based on the project context, evaluate observability practices. Can developers trace a request through the entire system? Consider structured logging formats, correlation IDs, distributed tracing, health check endpoints, and developer-friendly log querying.',
  },
  {
    id: 'dx-feature-flags',
    category: 'dx',
    title: 'Feature Flags',
    description: 'Gradual rollouts and kill switches',
    prompt:
      'Based on the project context, evaluate feature flag needs. What features would benefit from gradual rollouts, A/B testing, or kill switches? Consider feature flag infrastructure, flag lifecycle management, and strategies for cleaning up stale flags.',
  },
  {
    id: 'dx-database-migrations',
    category: 'dx',
    title: 'Database Migrations',
    description: 'Schema versioning and rollback strategies',
    prompt:
      'Based on the project context, review database migration practices. How are schema changes versioned and deployed? Consider zero-downtime migration patterns, rollback strategies, data backfill scripts, and migration testing in CI.',
  },
  {
    id: 'dx-monorepo-conventions',
    category: 'dx',
    title: 'Monorepo Conventions',
    description: 'Package boundaries and import rules',
    prompt:
      'Based on the project context, review monorepo structure for boundary violations. Consider lint rules for cross-package imports, dependency graph visualization, build ordering enforcement, and shared-vs-private API surfaces.',
  },
  {
    id: 'dx-error-taxonomy',
    category: 'dx',
    title: 'Error Taxonomy',
    description: 'Classified error types with recovery hints',
    prompt:
      'Based on the project context, audit error paths for consistent classification. Consider error codes, machine-readable error types, user-facing vs developer-facing messages, and a centralized error catalog.',
  },
  {
    id: 'dx-api-playground',
    category: 'dx',
    title: 'API Playground',
    description: 'Interactive API exploration and testing',
    prompt:
      'Based on the project context, evaluate developer documentation interactivity. Consider Swagger/OpenAPI live docs, request/response examples, copy-paste code snippets, and authentication in playground mode.',
  },
  {
    id: 'dx-schema-validation',
    category: 'dx',
    title: 'Schema Validation',
    description: 'Runtime validation at system boundaries',
    prompt:
      'Based on the project context, identify where untyped data crosses trust boundaries (API inputs, file reads, config loading). Consider Zod/Joi schemas, validation middleware, parse-dont-validate patterns, and clear error messages.',
  },
  {
    id: 'dx-debug-tooling',
    category: 'dx',
    title: 'Debug Tooling',
    description: 'Developer-mode inspectors and panels',
    prompt:
      'Based on the project context, evaluate debugging experience for complex state. Consider debug panels, state inspection overlays, event log viewers, performance flame graphs, and conditional debug-only routes.',
  },
  {
    id: 'dx-changelog-automation',
    category: 'dx',
    title: 'Changelog Automation',
    description: 'Automated release notes from commits',
    prompt:
      'Based on the project context, review release process for manual documentation toil. Consider conventional commits, auto-generated changelogs, PR-based release notes, and semantic versioning automation.',
  },
  {
    id: 'dx-type-safety-gaps',
    category: 'dx',
    title: 'Type Safety Gaps',
    description: 'Untyped boundaries and any usage',
    prompt:
      'Based on the project context, audit codebase for type-safety erosion. Consider any casts, untyped JSON parsing, external API response typing, and strategies to progressively tighten types without breaking changes.',
  },
  {
    id: 'dx-dev-containers',
    category: 'dx',
    title: 'Dev Containers',
    description: 'Reproducible development environments',
    prompt:
      'Based on the project context, evaluate environment setup friction. Consider devcontainer.json, GitHub Codespaces configs, Nix flakes, pre-built images, and environment parity with CI.',
  },
  {
    id: 'dx-hot-reload',
    category: 'dx',
    title: 'Hot Reload Reliability',
    description: 'Fast feedback loop preservation',
    prompt:
      'Based on the project context, identify hot reload failures and slow rebuilds. Consider HMR boundary issues, state loss on reload, rebuild time optimization, and strategies for maintaining fast iteration cycles.',
  },
  {
    id: 'dx-migration-scripts',
    category: 'dx',
    title: 'Data Migration Scripts',
    description: 'Safe data transformation tooling',
    prompt:
      'Based on the project context, evaluate need for one-off data transformations. Consider dry-run modes, idempotent migrations, progress reporting, rollback capabilities, and testing migrations against production-like data.',
  },

  // Growth prompts
  {
    id: 'growth-onboarding',
    category: 'growth',
    title: 'Onboarding Flow',
    description: 'Improve new user experience',
    prompt:
      'Based on the project context, suggest improvements to the onboarding experience. How can we help new users understand the value and get started quickly? Consider tutorials, progressive disclosure, and quick wins.',
  },
  {
    id: 'growth-engagement',
    category: 'growth',
    title: 'User Engagement',
    description: 'Increase user retention and activity',
    prompt:
      'Based on the project context, suggest features that would increase user engagement and retention. What would bring users back daily? Consider notifications, streaks, social features, and personalization.',
  },
  {
    id: 'growth-sharing',
    category: 'growth',
    title: 'Shareability',
    description: 'Make the app more shareable',
    prompt:
      'Based on the project context, suggest ways to make the application more shareable. What features would encourage users to invite others or share their work? Consider collaboration, public profiles, and export features.',
  },
  {
    id: 'growth-monetization',
    category: 'growth',
    title: 'Monetization Ideas',
    description: 'Identify potential revenue streams',
    prompt:
      'Based on the project context, what features or tiers could support monetization? Consider premium features, usage limits, team features, and integrations that users would pay for.',
  },
  {
    id: 'growth-referrals',
    category: 'growth',
    title: 'Referral Programs',
    description: 'Invite rewards and viral loops',
    prompt:
      'Based on the project context, design referral and viral growth mechanisms. What incentives would motivate users to invite others? Consider referral rewards, invite-a-friend flows, viral loops where sharing is part of the core workflow, and ambassador programs.',
  },
  {
    id: 'growth-content-marketing',
    category: 'growth',
    title: 'Content Marketing',
    description: 'SEO, blog integration, and landing pages',
    prompt:
      'Based on the project context, identify content marketing opportunities. What user-generated or app-generated content could drive organic traffic? Consider blog integration, SEO-optimized public pages, knowledge base articles, and shareable reports or dashboards.',
  },
  {
    id: 'growth-segmentation',
    category: 'growth',
    title: 'User Segmentation',
    description: 'Cohort analysis and persona targeting',
    prompt:
      'Based on the project context, evaluate user segmentation opportunities. How could the app deliver personalized experiences to different user cohorts? Consider behavioral segments, persona-based onboarding paths, and targeted feature recommendations.',
  },
  {
    id: 'growth-in-app-messaging',
    category: 'growth',
    title: 'In-App Messaging',
    description: 'Announcements, changelogs, and product tours',
    prompt:
      'Based on the project context, design an in-app messaging strategy. How should product updates, feature announcements, and tips be communicated? Consider changelog modals, banner notifications, contextual product tours, and release note integrations.',
  },
  {
    id: 'growth-pricing',
    category: 'growth',
    title: 'Pricing Strategy',
    description: 'Tiered plans and usage-based billing',
    prompt:
      'Based on the project context, evaluate pricing model options. What features differentiate free vs paid tiers? Consider usage-based billing, per-seat pricing, feature gating, trial periods, and freemium-to-paid conversion strategies.',
  },
  {
    id: 'growth-community',
    category: 'growth',
    title: 'Community Features',
    description: 'Forums, user content, and knowledge base',
    prompt:
      'Based on the project context, identify community-building opportunities. Would forums, user-generated content, or a knowledge base add value? Consider discussion boards, shared templates/presets, community voting on feature requests, and plugin/extension ecosystems.',
  },
  {
    id: 'growth-localization',
    category: 'growth',
    title: 'Localization',
    description: 'Multi-language and locale-aware formatting',
    prompt:
      'Based on the project context, evaluate internationalization needs. Which markets would benefit from localized content? Consider i18n infrastructure, translation workflows, RTL layout support, locale-aware date/number formatting, and cultural adaptation beyond translation.',
  },
  {
    id: 'growth-activation-metrics',
    category: 'growth',
    title: 'Activation Metrics',
    description: 'Time-to-value and aha-moment tracking',
    prompt:
      'Based on the project context, identify the "aha moment" for new users. Consider activation event definition, time-to-first-value measurement, drop-off before activation, and interventions to accelerate activation.',
  },
  {
    id: 'growth-churn-prevention',
    category: 'growth',
    title: 'Churn Prevention',
    description: 'At-risk user detection and retention',
    prompt:
      'Based on the project context, analyze signals that predict user churn. Consider engagement scoring, automated win-back campaigns, exit surveys, and personalized re-engagement triggers.',
  },
  {
    id: 'growth-social-proof',
    category: 'growth',
    title: 'Social Proof',
    description: 'Testimonials, usage stats, and trust signals',
    prompt:
      'Based on the project context, identify where social proof would increase conversion. Consider user count displays, customer logos, testimonial widgets, case study integration, and real-time activity feeds.',
  },
  {
    id: 'growth-self-serve-upgrade',
    category: 'growth',
    title: 'Self-Serve Upgrade',
    description: 'Frictionless plan upgrade flows',
    prompt:
      'Based on the project context, evaluate upgrade path friction. Consider contextual upgrade prompts at limits, comparison tables, trial-to-paid flow, prorated billing, and immediate feature unlocking.',
  },
  {
    id: 'growth-marketplace',
    category: 'growth',
    title: 'Marketplace',
    description: 'User-generated templates and extensions',
    prompt:
      'Based on the project context, evaluate ecosystem expansion opportunities. Consider template marketplace, community plugins, rating and review systems, revenue sharing, and curation controls.',
  },
  {
    id: 'growth-email-lifecycle',
    category: 'growth',
    title: 'Email Lifecycle',
    description: 'Drip campaigns and transactional emails',
    prompt:
      'Based on the project context, design lifecycle email strategy. Consider welcome sequences, feature education drips, re-engagement campaigns, transactional email design, and unsubscribe management.',
  },
  {
    id: 'growth-product-led',
    category: 'growth',
    title: 'Product-Led Growth',
    description: 'In-product viral mechanics',
    prompt:
      'Based on the project context, identify ways the product itself drives acquisition. Consider shareable outputs, collaboration invites, public profiles, embed widgets, and "powered by" attribution.',
  },
  {
    id: 'growth-api-ecosystem',
    category: 'growth',
    title: 'API Ecosystem',
    description: 'Developer adoption and third-party integrations',
    prompt:
      'Based on the project context, evaluate API as growth channel. Consider developer portal, API key self-service, usage dashboards, integration directory, and partner programs for top integrators.',
  },
  {
    id: 'growth-usage-limits',
    category: 'growth',
    title: 'Usage Limits',
    description: 'Fair-use enforcement and upgrade triggers',
    prompt:
      'Based on the project context, design usage metering that drives upgrades without frustrating users. Consider grace periods, graduated limits, clear usage dashboards, overage handling, and limit-approach notifications.',
  },
  {
    id: 'growth-network-effects',
    category: 'growth',
    title: 'Network Effects',
    description: 'Value increases with each user',
    prompt:
      'Based on the project context, identify features whose value scales with user count. Consider shared workspaces, collaborative features, community content, network-effect flywheels, and invite-driven feature unlocks.',
  },

  // Technical prompts
  {
    id: 'tech-performance',
    category: 'technical',
    title: 'Performance Optimization',
    description: 'Identify performance bottlenecks',
    prompt:
      'Based on the project context, suggest performance optimization opportunities. Where might bottlenecks exist? Consider database queries, API calls, bundle size, rendering, and caching strategies.',
  },
  {
    id: 'tech-architecture',
    category: 'technical',
    title: 'Architecture Review',
    description: 'Evaluate and improve architecture',
    prompt:
      'Based on the project context, suggest architectural improvements. What would make the codebase more maintainable, scalable, or testable? Consider separation of concerns, dependency management, and patterns.',
  },
  {
    id: 'tech-debt',
    category: 'technical',
    title: 'Technical Debt',
    description: 'Identify areas needing refactoring',
    prompt:
      'Based on the project context, identify potential technical debt. What areas might be becoming hard to maintain or understand? What refactoring would have the highest impact? Consider duplicated code, complexity, and outdated patterns.',
  },
  {
    id: 'tech-security',
    category: 'technical',
    title: 'Security Review',
    description: 'Identify security improvements',
    prompt:
      'Based on the project context, review for security improvements. What best practices are missing? Consider authentication, authorization, input validation, and data protection. Note: This is for improvement suggestions, not a security audit.',
  },
  {
    id: 'tech-api-design',
    category: 'technical',
    title: 'API Design Review',
    description: 'RESTful consistency and rate limiting',
    prompt:
      'Based on the project context, review API design for consistency and best practices. Are endpoints following RESTful conventions? Consider resource naming, HTTP method usage, pagination patterns, error response formats, rate limiting, and API documentation (OpenAPI/Swagger).',
  },
  {
    id: 'tech-event-driven',
    category: 'technical',
    title: 'Event-Driven Architecture',
    description: 'Message queues and pub/sub patterns',
    prompt:
      'Based on the project context, evaluate event-driven architecture opportunities. What tightly-coupled synchronous operations could benefit from async messaging? Consider message queues, pub/sub patterns, event sourcing, CQRS, and eventual consistency trade-offs.',
  },
  {
    id: 'tech-iac',
    category: 'technical',
    title: 'Infrastructure as Code',
    description: 'Environment reproducibility and automation',
    prompt:
      'Based on the project context, evaluate infrastructure automation. Is the infrastructure reproducible from code? Consider Terraform/Pulumi/CDK patterns, environment parity, infrastructure drift detection, and automated provisioning for development, staging, and production.',
  },
  {
    id: 'tech-disaster-recovery',
    category: 'technical',
    title: 'Disaster Recovery',
    description: 'Backup strategies and failover patterns',
    prompt:
      'Based on the project context, evaluate disaster recovery readiness. What happens if critical services fail? Consider backup strategies, automated failover, RTO/RPO targets, data replication, and recovery runbooks that ensure business continuity.',
  },
  {
    id: 'tech-service-boundaries',
    category: 'technical',
    title: 'Service Boundaries',
    description: 'Domain-driven design and decomposition',
    prompt:
      'Based on the project context, evaluate service boundary design. Are domain boundaries well-defined? Consider bounded contexts, microservice decomposition criteria, API gateway patterns, shared vs isolated databases, and inter-service communication strategies.',
  },
  {
    id: 'tech-data-modeling',
    category: 'technical',
    title: 'Data Modeling',
    description: 'Schema design and data lifecycle',
    prompt:
      'Based on the project context, review data modeling decisions. Are schemas normalized appropriately? Consider indexing strategies, data lifecycle management, archival policies, polymorphic data patterns, and trade-offs between normalization and query performance.',
  },
  {
    id: 'tech-observability-stack',
    category: 'technical',
    title: 'Observability Stack',
    description: 'Metrics, logs, and traces pipeline',
    prompt:
      'Based on the project context, evaluate the observability stack. Can the team diagnose production issues quickly? Consider metrics collection (Prometheus/Datadog), log aggregation (ELK/Loki), distributed tracing (Jaeger/Tempo), alerting rules, and SLO/SLI definitions.',
  },
  {
    id: 'tech-config-management',
    category: 'technical',
    title: 'Configuration Management',
    description: 'Environment configs and secrets handling',
    prompt:
      'Based on the project context, review configuration management. How are environment-specific configs, feature toggles, and secrets handled? Consider config validation at startup, secret rotation, environment variable documentation, and configuration drift detection.',
  },
  {
    id: 'tech-api-gateway',
    category: 'technical',
    title: 'API Gateway',
    description: 'Centralized routing, auth, and rate limiting',
    prompt:
      'Based on the project context, evaluate need for an API gateway layer. Consider request routing, authentication consolidation, rate limiting, request/response transformation, and API key management.',
  },
  {
    id: 'tech-database-strategy',
    category: 'technical',
    title: 'Database Strategy',
    description: 'Polyglot persistence and scaling patterns',
    prompt:
      'Based on the project context, review database choices against workload patterns. Consider read replicas, write-through caching, polyglot persistence, connection pooling, and scaling triggers.',
  },
  {
    id: 'tech-idempotency',
    category: 'technical',
    title: 'Idempotent Operations',
    description: 'Safe retries and exactly-once semantics',
    prompt:
      'Based on the project context, identify operations that break on retry. Consider idempotency keys, at-least-once delivery handling, deduplication strategies, and client retry guidance.',
  },
  {
    id: 'tech-graceful-shutdown',
    category: 'technical',
    title: 'Graceful Shutdown',
    description: 'Zero-downtime deploys and drain patterns',
    prompt:
      'Based on the project context, evaluate deployment safety. Consider SIGTERM handling, in-flight request completion, connection draining, health check transitions, and rolling deployment strategies.',
  },
  {
    id: 'tech-dependency-injection',
    category: 'technical',
    title: 'Dependency Injection',
    description: 'Testable and modular service composition',
    prompt:
      'Based on the project context, audit service construction for tight coupling. Consider constructor injection patterns, interface-based dependencies, test double substitution, and service registry patterns.',
  },
  {
    id: 'tech-state-machines',
    category: 'technical',
    title: 'State Machine Design',
    description: 'Explicit state transitions and invariants',
    prompt:
      'Based on the project context, identify entities with complex lifecycle states. Consider state machine libraries, transition validation, state persistence, event sourcing of transitions, and visualization of state graphs.',
  },
  {
    id: 'tech-schema-evolution',
    category: 'technical',
    title: 'Schema Evolution',
    description: 'Backward-compatible data format changes',
    prompt:
      'Based on the project context, evaluate data format evolution strategy. Consider additive-only changes, format version fields, migration-on-read patterns, schema registries, and compatibility testing.',
  },
  {
    id: 'tech-rate-limiting',
    category: 'technical',
    title: 'Rate Limiting Strategy',
    description: 'Multi-tier throttling and backpressure',
    prompt:
      'Based on the project context, design rate limiting beyond simple per-IP limits. Consider user-tier limits, endpoint-specific budgets, sliding window vs token bucket, graceful 429 responses, and client SDK retry-after guidance.',
  },
  {
    id: 'tech-async-patterns',
    category: 'technical',
    title: 'Async Processing',
    description: 'Job queues and background workflows',
    prompt:
      'Based on the project context, identify synchronous bottlenecks that should be async. Consider job queue infrastructure, dead letter handling, progress tracking, priority lanes, and workflow orchestration for multi-step processes.',
  },
  {
    id: 'tech-multi-region',
    category: 'technical',
    title: 'Multi-Region Design',
    description: 'Data sovereignty and geographic distribution',
    prompt:
      'Based on the project context, evaluate geographic distribution needs. Consider data residency requirements, read-replica placement, cross-region failover, eventual consistency trade-offs, and latency-based routing.',
  },

  // Security prompts
  {
    id: 'security-auth',
    category: 'security',
    title: 'Authentication Security',
    description: 'Review authentication mechanisms',
    prompt:
      'Based on the project context, analyze the authentication system. What security improvements would strengthen user authentication? Consider password policies, session management, MFA, and token handling.',
  },
  {
    id: 'security-data',
    category: 'security',
    title: 'Data Protection',
    description: 'Protect sensitive user data',
    prompt:
      'Based on the project context, review how sensitive data is handled. What improvements would better protect user privacy? Consider encryption, data minimization, secure storage, and data retention policies.',
  },
  {
    id: 'security-input',
    category: 'security',
    title: 'Input Validation',
    description: 'Prevent injection attacks',
    prompt:
      'Based on the project context, analyze input handling. Where could input validation be strengthened? Consider SQL injection, XSS, command injection, and file upload vulnerabilities.',
  },
  {
    id: 'security-api',
    category: 'security',
    title: 'API Security',
    description: 'Secure API endpoints',
    prompt:
      'Based on the project context, review API security. What improvements would make the API more secure? Consider rate limiting, authorization, CORS, and request validation.',
  },
  {
    id: 'security-dependencies',
    category: 'security',
    title: 'Dependency Vulnerabilities',
    description: 'Supply chain attacks and SCA scanning',
    prompt:
      'Based on the project context, evaluate dependency security. Are there known vulnerabilities in third-party packages? Consider software composition analysis (SCA), lockfile integrity checks, automated vulnerability scanning in CI, and strategies to mitigate supply chain attacks.',
  },
  {
    id: 'security-secrets',
    category: 'security',
    title: 'Secrets Management',
    description: 'Vault integration and rotation policies',
    prompt:
      'Based on the project context, review secrets management practices. How are API keys, tokens, and credentials stored and rotated? Consider vault integration, environment variable hygiene, secret scanning in commits, and automated rotation policies.',
  },
  {
    id: 'security-cors-csp',
    category: 'security',
    title: 'CORS & CSP Policies',
    description: 'Content security and cross-origin headers',
    prompt:
      'Based on the project context, review Content Security Policy and CORS configurations. Are CSP headers restrictive enough to prevent XSS? Consider script-src directives, CORS allowed origins, frame-ancestors, and security headers like HSTS, X-Content-Type-Options.',
  },
  {
    id: 'security-audit-logging',
    category: 'security',
    title: 'Audit Logging',
    description: 'Tamper-proof trails and compliance readiness',
    prompt:
      'Based on the project context, evaluate audit logging capabilities. Can you answer "who did what, when, and from where"? Consider immutable audit trails, sensitive action logging, compliance requirements (SOC2/GDPR), log retention policies, and tamper detection.',
  },
  {
    id: 'security-zero-trust',
    category: 'security',
    title: 'Zero Trust Architecture',
    description: 'Least privilege and service-to-service auth',
    prompt:
      'Based on the project context, evaluate zero trust principles. Does every request get verified regardless of network location? Consider least-privilege access, service-to-service authentication (mTLS), network segmentation, and microsegmentation strategies.',
  },
  {
    id: 'security-file-handling',
    category: 'security',
    title: 'Secure File Handling',
    description: 'Upload validation and path traversal prevention',
    prompt:
      'Based on the project context, review file handling security. How are file uploads validated and stored? Consider file type validation, size limits, path traversal prevention, malware scanning, secure storage locations, and content-disposition headers for downloads.',
  },
  {
    id: 'security-incident-response',
    category: 'security',
    title: 'Incident Response',
    description: 'Breach playbooks and security alerting',
    prompt:
      'Based on the project context, evaluate incident response readiness. Is there a plan for security breaches? Consider incident response playbooks, security alerting thresholds, forensics-friendly logging, breach notification procedures, and post-incident review processes.',
  },
  {
    id: 'security-rbac',
    category: 'security',
    title: 'RBAC Design',
    description: 'Fine-grained role and permission modeling',
    prompt:
      'Based on the project context, review authorization granularity. Consider role hierarchy, permission inheritance, resource-level permissions, UI element visibility based on roles, and admin delegation.',
  },
  {
    id: 'security-session-management',
    category: 'security',
    title: 'Session Management',
    description: 'Token lifecycle and concurrent session control',
    prompt:
      'Based on the project context, audit session handling patterns. Consider token expiration strategy, refresh token rotation, concurrent session limits, device management UI, and forced logout capabilities.',
  },
  {
    id: 'security-rate-abuse',
    category: 'security',
    title: 'Rate Limit Abuse',
    description: 'Brute force and enumeration prevention',
    prompt:
      'Based on the project context, identify abuse-prone endpoints like login, signup, and password reset. Consider progressive delays, CAPTCHA triggers, account lockout policies, and IP reputation scoring.',
  },
  {
    id: 'security-data-classification',
    category: 'security',
    title: 'Data Classification',
    description: 'Sensitivity levels and handling rules',
    prompt:
      'Based on the project context, audit data types for sensitivity classification. Consider PII identification, data tagging taxonomy, handling rules per classification level, and automated scanning for misclassified data.',
  },
  {
    id: 'security-supply-chain',
    category: 'security',
    title: 'Supply Chain Security',
    description: 'Build integrity and artifact verification',
    prompt:
      'Based on the project context, evaluate build pipeline security. Consider reproducible builds, SBOM generation, artifact signing, provenance attestation, and build environment isolation.',
  },
  {
    id: 'security-pen-testing',
    category: 'security',
    title: 'Penetration Testing',
    description: 'Automated security scanning integration',
    prompt:
      'Based on the project context, evaluate security testing automation. Consider DAST tools in CI, SAST analysis, dependency scanning, container scanning, and scheduled penetration test planning.',
  },
  {
    id: 'security-encryption-at-rest',
    category: 'security',
    title: 'Encryption at Rest',
    description: 'Data encryption and key management',
    prompt:
      'Based on the project context, audit data storage encryption. Consider field-level encryption for PII, key rotation schedules, KMS integration, encrypted backups, and key access auditing.',
  },
  {
    id: 'security-api-auth',
    category: 'security',
    title: 'API Authentication',
    description: 'Machine-to-machine auth and key scoping',
    prompt:
      'Based on the project context, review API authentication for non-human callers. Consider API key scoping, OAuth2 client credentials, JWT claims design, key rotation, and per-key audit trails.',
  },
  {
    id: 'security-container-hardening',
    category: 'security',
    title: 'Container Hardening',
    description: 'Minimal images and runtime restrictions',
    prompt:
      'Based on the project context, evaluate container security posture. Consider distroless base images, read-only filesystems, non-root execution, seccomp profiles, and container vulnerability scanning.',
  },
  {
    id: 'security-privacy-by-design',
    category: 'security',
    title: 'Privacy by Design',
    description: 'Data minimization and consent architecture',
    prompt:
      'Based on the project context, evaluate privacy engineering practices. Consider data minimization, purpose limitation, consent management, right-to-erasure implementation, and privacy impact assessments.',
  },

  // Performance prompts
  {
    id: 'perf-frontend',
    category: 'performance',
    title: 'Frontend Performance',
    description: 'Optimize UI rendering and loading',
    prompt:
      'Based on the project context, analyze frontend performance. What optimizations would improve load times and responsiveness? Consider bundle splitting, lazy loading, memoization, and render optimization.',
  },
  {
    id: 'perf-backend',
    category: 'performance',
    title: 'Backend Performance',
    description: 'Optimize server-side operations',
    prompt:
      'Based on the project context, review backend performance. What optimizations would improve response times? Consider database queries, caching strategies, async operations, and resource pooling.',
  },
  {
    id: 'perf-database',
    category: 'performance',
    title: 'Database Optimization',
    description: 'Improve query performance',
    prompt:
      'Based on the project context, analyze database interactions. What optimizations would improve data access performance? Consider indexing, query optimization, denormalization, and connection pooling.',
  },
  {
    id: 'perf-caching',
    category: 'performance',
    title: 'Caching Strategies',
    description: 'Implement effective caching',
    prompt:
      'Based on the project context, review caching opportunities. Where would caching provide the most benefit? Consider API responses, computed values, static assets, and session data.',
  },
  {
    id: 'perf-bundle-size',
    category: 'performance',
    title: 'Bundle Size Optimization',
    description: 'Tree shaking, splitting, and dynamic imports',
    prompt:
      'Based on the project context, analyze JavaScript bundle size. What dependencies are bloating the bundle? Consider tree shaking effectiveness, code splitting by route, dynamic imports for heavy features, and bundle analysis tools to identify optimization targets.',
  },
  {
    id: 'perf-assets',
    category: 'performance',
    title: 'Image & Asset Optimization',
    description: 'Lazy loading and CDN strategies',
    prompt:
      'Based on the project context, review asset loading strategies. Are images and static assets optimized? Consider responsive images (srcset), lazy loading, WebP/AVIF formats, CDN caching, font subsetting, and preloading critical assets.',
  },
  {
    id: 'perf-memory-leaks',
    category: 'performance',
    title: 'Memory Leak Detection',
    description: 'Heap profiling and cleanup patterns',
    prompt:
      'Based on the project context, identify potential memory leak risks. Where might event listeners, subscriptions, or references not be properly cleaned up? Consider React effect cleanup, WebSocket connection management, timer/interval clearing, and heap profiling strategies.',
  },
  {
    id: 'perf-api-response',
    category: 'performance',
    title: 'API Response Optimization',
    description: 'Pagination, field selection, and compression',
    prompt:
      'Based on the project context, review API response efficiency. Are responses returning more data than needed? Consider pagination strategies, sparse fieldsets, response compression (gzip/brotli), ETags for conditional requests, and GraphQL-style field selection.',
  },
  {
    id: 'perf-concurrency',
    category: 'performance',
    title: 'Concurrent Processing',
    description: 'Worker threads and parallel execution',
    prompt:
      'Based on the project context, identify CPU-intensive or blocking operations. What work could be parallelized? Consider worker threads, job queues (Bull/BullMQ), background processing, task scheduling, and strategies for non-blocking I/O patterns.',
  },
  {
    id: 'perf-realtime',
    category: 'performance',
    title: 'Real-time Performance',
    description: 'WebSocket optimization and streaming',
    prompt:
      'Based on the project context, evaluate real-time communication performance. How efficient are WebSocket connections and event streaming? Consider connection pooling, message batching, binary protocols, backpressure handling, and reconnection strategies.',
  },
  {
    id: 'perf-cold-start',
    category: 'performance',
    title: 'Cold Start Optimization',
    description: 'Startup profiling and lazy initialization',
    prompt:
      'Based on the project context, analyze application startup performance. What happens during cold start? Consider lazy initialization of expensive services, module loading optimization, connection pool warming, and startup profiling to identify bottlenecks.',
  },
  {
    id: 'perf-n-plus-one',
    category: 'performance',
    title: 'N+1 Query Detection',
    description: 'Batch loading and query coalescing',
    prompt:
      'Based on the project context, audit data-fetching code for N+1 patterns. Consider DataLoader/batch loading, eager loading strategies, query logging in dev mode, and automated detection in tests.',
  },
  {
    id: 'perf-virtualization',
    category: 'performance',
    title: 'List Virtualization',
    description: 'Render only visible items in large lists',
    prompt:
      'Based on the project context, identify large lists or tables causing render lag. Consider virtual scrolling libraries, row height estimation, scroll position restoration, and keyboard navigation in virtualized lists.',
  },
  {
    id: 'perf-prefetching',
    category: 'performance',
    title: 'Predictive Prefetching',
    description: 'Anticipate user actions to eliminate waits',
    prompt:
      'Based on the project context, identify high-probability navigation paths. Consider link prefetching, hover-triggered data loading, prefetch on idle, and cache warming for likely next actions.',
  },
  {
    id: 'perf-debounce-throttle',
    category: 'performance',
    title: 'Debounce & Throttle',
    description: 'Rate-limit expensive UI operations',
    prompt:
      'Based on the project context, find search inputs, resize handlers, and scroll listeners without rate limiting. Consider debounce timing tuning, throttle for animations, and abort-controller patterns for superseded requests.',
  },
  {
    id: 'perf-ssr-hydration',
    category: 'performance',
    title: 'SSR & Hydration',
    description: 'Server rendering and hydration optimization',
    prompt:
      'Based on the project context, evaluate server-side rendering opportunities. Consider selective hydration, streaming SSR, hydration mismatch detection, and progressive hydration for below-fold content.',
  },
  {
    id: 'perf-connection-pooling',
    category: 'performance',
    title: 'Connection Pooling',
    description: 'Resource reuse and limit management',
    prompt:
      'Based on the project context, audit external connection management. Consider database pool sizing, HTTP keep-alive, WebSocket connection reuse, pool exhaustion monitoring, and connection timeout tuning.',
  },
  {
    id: 'perf-edge-caching',
    category: 'performance',
    title: 'Edge Caching',
    description: 'CDN and edge-compute strategies',
    prompt:
      'Based on the project context, evaluate opportunities for edge-layer caching. Consider CDN cache rules, stale-while-revalidate, edge functions for personalization, cache invalidation strategy, and cache hit ratio monitoring.',
  },
  {
    id: 'perf-lazy-init',
    category: 'performance',
    title: 'Lazy Initialization',
    description: 'Defer expensive setup until needed',
    prompt:
      'Based on the project context, audit startup code for eagerly initialized resources. Consider lazy singletons, on-demand module loading, deferred database connections, and startup profiling to prioritize.',
  },
  {
    id: 'perf-render-optimization',
    category: 'performance',
    title: 'Render Optimization',
    description: 'Minimize unnecessary re-renders',
    prompt:
      'Based on the project context, profile React component render frequency. Consider memo boundaries, selector patterns, context splitting, useDeferredValue for non-urgent updates, and React Compiler compatibility.',
  },
  {
    id: 'perf-payload-optimization',
    category: 'performance',
    title: 'Payload Optimization',
    description: 'Reduce data transfer size',
    prompt:
      'Based on the project context, audit API payloads and initial page loads. Consider response field trimming, binary protocols like protobuf, delta updates for real-time data, and compression algorithm selection.',
  },

  // Accessibility prompts
  {
    id: 'a11y-keyboard',
    category: 'accessibility',
    title: 'Keyboard Navigation',
    description: 'Enable full keyboard access',
    prompt:
      'Based on the project context, analyze keyboard accessibility. What improvements would enable users to navigate entirely with keyboard? Consider focus management, tab order, and keyboard shortcuts.',
  },
  {
    id: 'a11y-screen-reader',
    category: 'accessibility',
    title: 'Screen Reader Support',
    description: 'Improve screen reader experience',
    prompt:
      'Based on the project context, review screen reader compatibility. What improvements would help users with visual impairments? Consider ARIA labels, semantic HTML, live regions, and alt text.',
  },
  {
    id: 'a11y-visual',
    category: 'accessibility',
    title: 'Visual Accessibility',
    description: 'Improve visual design for all users',
    prompt:
      'Based on the project context, analyze visual accessibility. What improvements would help users with visual impairments? Consider color contrast, text sizing, focus indicators, and reduced motion.',
  },
  {
    id: 'a11y-forms',
    category: 'accessibility',
    title: 'Accessible Forms',
    description: 'Make forms usable for everyone',
    prompt:
      'Based on the project context, review form accessibility. What improvements would make forms more accessible? Consider labels, error messages, required field indicators, and input assistance.',
  },
  {
    id: 'a11y-wcag-audit',
    category: 'accessibility',
    title: 'WCAG Compliance Audit',
    description: 'AA/AAA gap analysis and automated testing',
    prompt:
      'Based on the project context, evaluate WCAG 2.1 compliance gaps. What Level AA criteria are not met? Consider automated accessibility testing in CI (axe-core, Lighthouse), manual testing checklists, and a roadmap for achieving AA compliance across all views.',
  },
  {
    id: 'a11y-i18n',
    category: 'accessibility',
    title: 'Internationalization (i18n)',
    description: 'RTL support and locale-aware components',
    prompt:
      'Based on the project context, evaluate internationalization readiness. Does the layout support RTL languages? Consider bidirectional text handling, locale-aware date/number/currency formatting, pluralization rules, and component designs that adapt to text expansion.',
  },
  {
    id: 'a11y-cognitive',
    category: 'accessibility',
    title: 'Cognitive Accessibility',
    description: 'Plain language and predictable behavior',
    prompt:
      'Based on the project context, evaluate cognitive accessibility. Is the interface predictable and easy to understand? Consider plain language, consistent navigation patterns, clear action labels, adequate timeouts, and support for users with cognitive disabilities.',
  },
  {
    id: 'a11y-touch',
    category: 'accessibility',
    title: 'Touch Accessibility',
    description: 'Target sizing and gesture alternatives',
    prompt:
      'Based on the project context, review touch accessibility. Do interactive elements meet minimum touch target sizes (44x44px)? Consider gesture alternatives for complex interactions, avoiding hover-only functionality, and ensuring drag-and-drop has keyboard alternatives.',
  },
  {
    id: 'a11y-media',
    category: 'accessibility',
    title: 'Media Accessibility',
    description: 'Captions, descriptions, and transcripts',
    prompt:
      'Based on the project context, review media accessibility. Do videos have captions and audio descriptions? Consider auto-generated transcripts, alt text for complex images/charts, audio-only alternatives, and ensuring media controls are keyboard-accessible.',
  },
  {
    id: 'a11y-error-announcements',
    category: 'accessibility',
    title: 'Error Accessibility',
    description: 'Accessible error announcements and focus',
    prompt:
      'Based on the project context, review how errors are communicated to assistive technology. Are errors announced via ARIA live regions? Consider focus management when errors appear, inline vs summary error patterns, and ensuring error messages are associated with their inputs.',
  },
  {
    id: 'a11y-reduced-motion',
    category: 'accessibility',
    title: 'Reduced Motion',
    description: 'Animation preferences and static alternatives',
    prompt:
      'Based on the project context, review motion and animation accessibility. Does the app respect prefers-reduced-motion? Consider providing static alternatives for animations, avoiding auto-playing content, reducing parallax effects, and ensuring no content depends solely on motion.',
  },
  {
    id: 'a11y-focus-management',
    category: 'accessibility',
    title: 'Focus Management',
    description: 'Programmatic focus for dynamic content',
    prompt:
      'Based on the project context, audit modal openings, route changes, and dynamic content for focus handling. Consider focus trapping in modals, returning focus on close, skip links, and focus rings for keyboard users.',
  },
  {
    id: 'a11y-live-regions',
    category: 'accessibility',
    title: 'Live Regions',
    description: 'Announce dynamic changes to assistive tech',
    prompt:
      'Based on the project context, identify content that changes without user action such as toasts, counters, and status updates. Consider aria-live politeness levels, aria-atomic, debouncing rapid updates, and screen reader testing.',
  },
  {
    id: 'a11y-color-independence',
    category: 'accessibility',
    title: 'Color Independence',
    description: 'Convey meaning without color alone',
    prompt:
      'Based on the project context, audit where color is the sole differentiator like status badges and form errors. Consider adding icons, patterns, or text alongside color, and testing with color blindness simulators.',
  },
  {
    id: 'a11y-heading-hierarchy',
    category: 'accessibility',
    title: 'Heading Hierarchy',
    description: 'Semantic heading levels for navigation',
    prompt:
      'Based on the project context, audit heading structure across pages. Consider proper h1-h6 nesting, no skipped levels, heading-based screen reader navigation, and consistent heading patterns.',
  },
  {
    id: 'a11y-table-semantics',
    category: 'accessibility',
    title: 'Table Semantics',
    description: 'Accessible data tables with proper markup',
    prompt:
      'Based on the project context, review tables for semantic correctness. Consider caption elements, thead/tbody structure, th scope attributes, sortable column announcements, and responsive alternatives.',
  },
  {
    id: 'a11y-custom-controls',
    category: 'accessibility',
    title: 'Custom Controls',
    description: 'ARIA patterns for non-native widgets',
    prompt:
      'Based on the project context, audit custom UI widgets like dropdowns, sliders, and tabs. Consider WAI-ARIA authoring practices, role/state/property completeness, keyboard interaction patterns, and assistive tech testing.',
  },
  {
    id: 'a11y-page-titles',
    category: 'accessibility',
    title: 'Page Titles',
    description: 'Descriptive titles for every route',
    prompt:
      'Based on the project context, audit route changes for title updates. Consider dynamic title composition, breadcrumb-in-title patterns, screen reader announcement on navigation, and consistent title formatting.',
  },
  {
    id: 'a11y-timeout-warnings',
    category: 'accessibility',
    title: 'Timeout Warnings',
    description: 'Advance notice before session expiration',
    prompt:
      'Based on the project context, identify timed-out sessions or auto-logout features. Consider advance warning dialogs, extend-session options, saving work before timeout, and WCAG 2.2.1 timing adjustable requirements.',
  },
  {
    id: 'a11y-link-purpose',
    category: 'accessibility',
    title: 'Link Purpose',
    description: 'Descriptive link text and context',
    prompt:
      'Based on the project context, audit links for "click here" and "read more" anti-patterns. Consider descriptive link text, aria-label for icon-only links, distinguishing links from buttons, and external link indicators.',
  },
  {
    id: 'a11y-testing-automation',
    category: 'accessibility',
    title: 'A11y Test Automation',
    description: 'Automated accessibility checks in CI',
    prompt:
      'Based on the project context, evaluate accessibility testing in the development pipeline. Consider axe-core integration, Lighthouse CI, Storybook a11y addon, screen reader testing scripts, and regression testing for WCAG violations.',
  },

  // Analytics prompts
  {
    id: 'analytics-tracking',
    category: 'analytics',
    title: 'User Tracking',
    description: 'Track key user behaviors',
    prompt:
      'Based on the project context, analyze analytics opportunities. What user behaviors should be tracked to understand engagement? Consider page views, feature usage, conversion funnels, and session duration.',
  },
  {
    id: 'analytics-metrics',
    category: 'analytics',
    title: 'Key Metrics',
    description: 'Define success metrics',
    prompt:
      'Based on the project context, what key metrics should be tracked? Consider user acquisition, retention, engagement, and feature adoption. What dashboards would be most valuable?',
  },
  {
    id: 'analytics-errors',
    category: 'analytics',
    title: 'Error Monitoring',
    description: 'Track and analyze errors',
    prompt:
      'Based on the project context, review error handling for monitoring opportunities. What error tracking would help identify and fix issues faster? Consider error aggregation, alerting, and stack traces.',
  },
  {
    id: 'analytics-performance',
    category: 'analytics',
    title: 'Performance Monitoring',
    description: 'Track application performance',
    prompt:
      'Based on the project context, analyze performance monitoring opportunities. What metrics would help identify bottlenecks? Consider load times, API response times, and resource usage.',
  },
  {
    id: 'analytics-ab-testing',
    category: 'analytics',
    title: 'A/B Testing Framework',
    description: 'Experiment infrastructure and feature variants',
    prompt:
      'Based on the project context, evaluate A/B testing opportunities. What features or flows would benefit from experimentation? Consider experiment infrastructure, statistical significance calculation, user bucketing, feature variant management, and result analysis dashboards.',
  },
  {
    id: 'analytics-funnels',
    category: 'analytics',
    title: 'Funnel Analysis',
    description: 'Drop-off identification and conversion optimization',
    prompt:
      'Based on the project context, identify critical user funnels that should be tracked. Where are users dropping off? Consider signup-to-activation funnels, feature adoption flows, conversion paths, and bottleneck detection strategies.',
  },
  {
    id: 'analytics-cohort-retention',
    category: 'analytics',
    title: 'Cohort Retention',
    description: 'User lifecycle and churn prediction',
    prompt:
      'Based on the project context, design cohort retention analysis. How should users be grouped to understand retention patterns? Consider weekly/monthly cohorts, engagement scoring, churn prediction signals, and re-engagement trigger identification.',
  },
  {
    id: 'analytics-rum',
    category: 'analytics',
    title: 'Real User Monitoring (RUM)',
    description: 'Core Web Vitals and user-centric metrics',
    prompt:
      'Based on the project context, evaluate real user monitoring needs. Are Core Web Vitals (LCP, FID, CLS) being tracked? Consider user-centric performance metrics, geographic performance variations, device-specific issues, and real-world performance budgets.',
  },
  {
    id: 'analytics-bi',
    category: 'analytics',
    title: 'Business Intelligence',
    description: 'Revenue dashboards and executive reporting',
    prompt:
      'Based on the project context, identify business intelligence reporting needs. What dashboards would help leadership make decisions? Consider revenue metrics, usage trends, feature ROI, customer health scores, and automated executive summary reports.',
  },
  {
    id: 'analytics-data-pipeline',
    category: 'analytics',
    title: 'Data Pipeline',
    description: 'ETL processes and event streaming architecture',
    prompt:
      'Based on the project context, evaluate data pipeline needs. How should analytics events flow from capture to storage to visualization? Consider ETL processes, event streaming (Kafka/Kinesis), data warehousing, transformation layers, and data freshness requirements.',
  },
  {
    id: 'analytics-privacy',
    category: 'analytics',
    title: 'Privacy-Compliant Analytics',
    description: 'GDPR consent and data anonymization',
    prompt:
      'Based on the project context, evaluate analytics privacy compliance. Does tracking respect user consent preferences? Consider GDPR/CCPA consent management, data anonymization/pseudonymization, cookie-less tracking alternatives, and data retention policies.',
  },
  {
    id: 'analytics-event-taxonomy',
    category: 'analytics',
    title: 'Event Taxonomy',
    description: 'Structured naming conventions for events',
    prompt:
      'Based on the project context, evaluate analytics event naming consistency. Consider a naming convention like object_action format, event schema documentation, naming governance process, and tooling to enforce conventions.',
  },
  {
    id: 'analytics-attribution',
    category: 'analytics',
    title: 'Attribution Modeling',
    description: 'Source and medium tracking',
    prompt:
      'Based on the project context, evaluate marketing attribution capabilities. Consider UTM parameter handling, multi-touch attribution models, conversion credit distribution, and channel effectiveness reporting.',
  },
  {
    id: 'analytics-feature-adoption',
    category: 'analytics',
    title: 'Feature Adoption',
    description: 'Track feature discovery and usage depth',
    prompt:
      'Based on the project context, evaluate feature adoption tracking. Consider first-use detection, usage frequency patterns, feature discovery paths, power-user identification, and adoption funnel visualization.',
  },
  {
    id: 'analytics-session-replay',
    category: 'analytics',
    title: 'Session Replay',
    description: 'Record and replay user sessions',
    prompt:
      'Based on the project context, evaluate session replay opportunities. Consider privacy-safe recording, PII masking, frustration signal detection, reproduction of bug reports, and storage cost management.',
  },
  {
    id: 'analytics-custom-dashboards',
    category: 'analytics',
    title: 'Custom Dashboards',
    description: 'User-configurable reporting views',
    prompt:
      'Based on the project context, evaluate custom reporting needs. Consider drag-and-drop dashboard builders, saved report templates, scheduled report delivery, role-based dashboard access, and real-time vs batch data.',
  },
  {
    id: 'analytics-anomaly-detection',
    category: 'analytics',
    title: 'Anomaly Detection',
    description: 'Automated alerting on metric outliers',
    prompt:
      'Based on the project context, evaluate automated anomaly detection opportunities. Consider statistical baseline establishment, spike and dip detection, alert routing, false positive reduction, and root cause correlation.',
  },
  {
    id: 'analytics-data-warehouse',
    category: 'analytics',
    title: 'Data Warehouse Design',
    description: 'Star schema and dimensional modeling',
    prompt:
      'Based on the project context, evaluate data warehousing strategy. Consider star schema design, fact and dimension tables, ETL scheduling, query performance optimization, and data freshness requirements.',
  },
  {
    id: 'analytics-user-journey',
    category: 'analytics',
    title: 'User Journey Mapping',
    description: 'Cross-session behavior path analysis',
    prompt:
      'Based on the project context, evaluate user journey tracking capabilities. Consider cross-session identity resolution, path analysis visualization, journey stage classification, drop-off identification, and journey-based segmentation.',
  },
  {
    id: 'analytics-predictive',
    category: 'analytics',
    title: 'Predictive Analytics',
    description: 'ML-powered forecasting and recommendations',
    prompt:
      'Based on the project context, evaluate predictive analytics opportunities. Consider churn prediction models, usage forecasting, recommendation engines, propensity scoring, and ML model serving infrastructure.',
  },
  {
    id: 'analytics-cost-per-feature',
    category: 'analytics',
    title: 'Cost Per Feature',
    description: 'Infrastructure cost allocation per feature',
    prompt:
      'Based on the project context, evaluate infrastructure cost attribution. Consider per-feature resource tagging, cost allocation dashboards, cost-per-user calculations, optimization recommendations, and budget alert thresholds.',
  },

  // Reliability prompts
  {
    id: 'rel-slo-sli',
    category: 'reliability',
    title: 'SLOs & SLIs',
    description: 'Define service level objectives and indicators',
    prompt:
      'Based on the project context, identify the most critical user journeys and define service level objectives. Consider latency percentiles, availability targets, error rate budgets, SLI measurement points, and alerting thresholds tied to error budget burn rate.',
  },
  {
    id: 'rel-circuit-breakers',
    category: 'reliability',
    title: 'Circuit Breakers',
    description: 'Fail-fast patterns for degraded dependencies',
    prompt:
      'Based on the project context, identify external dependency calls that can hang or cascade failure. Consider circuit breaker states (closed/open/half-open), failure thresholds, fallback behaviors, and monitoring circuit state transitions.',
  },
  {
    id: 'rel-graceful-degradation',
    category: 'reliability',
    title: 'Graceful Degradation',
    description: 'Reduced functionality over total failure',
    prompt:
      'Based on the project context, design degraded modes for partial outages. Consider feature-level degradation tiers, dependency-aware fallbacks, user-facing degradation notices, and automatic recovery when dependencies return.',
  },
  {
    id: 'rel-chaos-engineering',
    category: 'reliability',
    title: 'Chaos Engineering',
    description: 'Proactive failure injection and resilience testing',
    prompt:
      'Based on the project context, evaluate readiness for controlled failure experiments. Consider failure injection tooling, blast radius containment, game day exercises, steady-state hypothesis definition, and automated chaos tests in staging.',
  },
  {
    id: 'rel-retry-patterns',
    category: 'reliability',
    title: 'Retry Patterns',
    description: 'Exponential backoff and jitter strategies',
    prompt:
      'Based on the project context, audit retry logic across the system. Consider exponential backoff with jitter, retry budgets, idempotent-safe retries, dead letter queues for exhausted retries, and client-visible retry state.',
  },
  {
    id: 'rel-health-checks',
    category: 'reliability',
    title: 'Health Checks',
    description: 'Liveness, readiness, and dependency probes',
    prompt:
      'Based on the project context, review health check completeness. Consider liveness vs readiness semantics, deep dependency checks, health check caching, graceful startup probes, and health check endpoint security.',
  },
  {
    id: 'rel-fault-isolation',
    category: 'reliability',
    title: 'Fault Isolation',
    description: 'Bulkhead patterns and blast radius containment',
    prompt:
      'Based on the project context, evaluate how failures propagate through the system. Consider bulkhead patterns with separate thread pools per dependency, isolation boundaries, failure domain mapping, and containment testing.',
  },
  {
    id: 'rel-error-budgets',
    category: 'reliability',
    title: 'Error Budgets',
    description: 'Balance reliability investment with feature velocity',
    prompt:
      'Based on the project context, design error budget policies. Consider error budget calculation from SLOs, budget depletion alerts, velocity slowdown policies when budget is low, and budget-based prioritization of reliability work.',
  },
  {
    id: 'rel-runbook-automation',
    category: 'reliability',
    title: 'Runbook Automation',
    description: 'Codified incident response procedures',
    prompt:
      'Based on the project context, audit manual operational procedures. Consider runbook-as-code, automated diagnostic collection, one-click remediation, escalation automation, and runbook coverage for known failure modes.',
  },
  {
    id: 'rel-capacity-planning',
    category: 'reliability',
    title: 'Capacity Planning',
    description: 'Load forecasting and scaling triggers',
    prompt:
      'Based on the project context, evaluate capacity headroom and growth projections. Consider load testing baselines, auto-scaling triggers, resource utilization dashboards, growth-rate extrapolation, and capacity planning reviews.',
  },

  // DevOps prompts
  {
    id: 'devops-deployment-strategy',
    category: 'devops',
    title: 'Deployment Strategy',
    description: 'Blue-green, canary, and rolling deploys',
    prompt:
      'Based on the project context, evaluate deployment risk and strategy. Consider blue-green deployments, canary releases with automated rollback, rolling updates, feature flags as deployment decoupling, and deployment frequency targets.',
  },
  {
    id: 'devops-incident-management',
    category: 'devops',
    title: 'Incident Management',
    description: 'Structured response and blameless postmortems',
    prompt:
      'Based on the project context, evaluate incident handling maturity. Consider severity classification, on-call rotation, incident commander role, communication templates, blameless postmortem process, and action item tracking.',
  },
  {
    id: 'devops-cost-optimization',
    category: 'devops',
    title: 'Cost Optimization',
    description: 'Cloud spend visibility and right-sizing',
    prompt:
      'Based on the project context, analyze infrastructure cost patterns. Consider resource right-sizing, reserved instance strategy, spot instance usage, cost allocation tagging, budget alerts, and idle resource detection.',
  },
  {
    id: 'devops-infra-drift',
    category: 'devops',
    title: 'Infrastructure Drift',
    description: 'Detect and reconcile config divergence',
    prompt:
      'Based on the project context, evaluate infrastructure-as-code compliance. Consider drift detection tools, automated reconciliation, policy-as-code guardrails, and infrastructure review in PR workflows.',
  },
  {
    id: 'devops-observability-pipeline',
    category: 'devops',
    title: 'Observability Pipeline',
    description: 'Centralized logs, metrics, and traces',
    prompt:
      'Based on the project context, design the observability data pipeline. Consider log aggregation, metrics collection agents, trace propagation, correlation IDs, and unified dashboards across all three pillars of observability.',
  },
  {
    id: 'devops-secret-rotation',
    category: 'devops',
    title: 'Secret Rotation',
    description: 'Automated credential lifecycle management',
    prompt:
      'Based on the project context, audit secrets for rotation practices. Consider automated rotation schedules, zero-downtime rotation patterns, rotation verification testing, and secret expiry alerts.',
  },
  {
    id: 'devops-preview-envs',
    category: 'devops',
    title: 'Preview Environments',
    description: 'Ephemeral envs for every pull request',
    prompt:
      'Based on the project context, evaluate PR review feedback loops. Consider per-PR preview deployments, database seeding for previews, automatic teardown, shareable preview URLs, and cost management for ephemeral environments.',
  },
  {
    id: 'devops-release-management',
    category: 'devops',
    title: 'Release Management',
    description: 'Versioning, tagging, and rollback procedures',
    prompt:
      'Based on the project context, review release process maturity. Consider semantic versioning automation, release branch strategy, rollback runbooks, release approval gates, and release communication workflows.',
  },
  {
    id: 'devops-database-ops',
    category: 'devops',
    title: 'Database Operations',
    description: 'Backup, restore, and operational procedures',
    prompt:
      'Based on the project context, evaluate database operational readiness. Consider automated backup verification with restore testing, point-in-time recovery, cross-region backup replication, and RTO/RPO compliance.',
  },
  {
    id: 'devops-toil-reduction',
    category: 'devops',
    title: 'Toil Reduction',
    description: 'Automate repetitive operational work',
    prompt:
      'Based on the project context, identify repetitive manual operational tasks. Consider automation ROI calculation, self-healing scripts, auto-remediation for known issues, and operational task tracking to measure toil reduction over time.',
  },

  // Data Management prompts
  {
    id: 'data-governance',
    category: 'data',
    title: 'Data Governance',
    description: 'Ownership, policies, and stewardship',
    prompt:
      'Based on the project context, evaluate data ownership clarity. Consider data domain owners, access policy definitions, data catalog or dictionary, and governance review processes for new data stores.',
  },
  {
    id: 'data-schema-evolution',
    category: 'data',
    title: 'Data Schema Evolution',
    description: 'Backward-compatible schema changes',
    prompt:
      'Based on the project context, review how data schemas change over time. Consider additive-only migrations, schema registry, consumer-driven contracts, version negotiation, and breaking change detection.',
  },
  {
    id: 'data-quality',
    category: 'data',
    title: 'Data Quality',
    description: 'Validation, completeness, and consistency checks',
    prompt:
      'Based on the project context, audit data quality practices. Consider data validation rules, completeness monitoring, consistency checks across stores, anomaly detection, and data quality dashboards.',
  },
  {
    id: 'data-lifecycle',
    category: 'data',
    title: 'Data Lifecycle',
    description: 'Retention, archival, and deletion policies',
    prompt:
      'Based on the project context, evaluate data retention practices. Consider tiered storage (hot/warm/cold), automated archival rules, TTL-based cleanup, legal hold support, and storage cost optimization.',
  },
  {
    id: 'data-lineage',
    category: 'data',
    title: 'Data Lineage',
    description: 'Track data origin and transformation chain',
    prompt:
      'Based on the project context, evaluate data traceability. Consider lineage tracking through ETL pipelines, impact analysis for schema changes, dependency mapping between data sources, and lineage visualization.',
  },
  {
    id: 'data-migration-patterns',
    category: 'data',
    title: 'Migration Patterns',
    description: 'Safe large-scale data transformation',
    prompt:
      'Based on the project context, evaluate data migration risk management. Consider dual-write patterns, shadow migrations, data validation checksums, rollback strategies, and progress monitoring for long-running migrations.',
  },
  {
    id: 'data-consistency',
    category: 'data',
    title: 'Consistency Patterns',
    description: 'Eventual consistency and conflict resolution',
    prompt:
      'Based on the project context, identify distributed data consistency challenges. Consider saga patterns, compensating transactions, conflict resolution strategies, consistency monitoring, and user-facing consistency expectations.',
  },
  {
    id: 'data-anonymization',
    category: 'data',
    title: 'Data Anonymization',
    description: 'Test data and privacy-safe environments',
    prompt:
      'Based on the project context, evaluate test and staging data practices. Consider production data anonymization, synthetic data generation, referential integrity in anonymized sets, and compliance verification.',
  },
  {
    id: 'data-backup-strategy',
    category: 'data',
    title: 'Backup Strategy',
    description: 'Multi-layer backup and recovery testing',
    prompt:
      'Based on the project context, audit backup coverage and reliability. Consider backup frequency per data criticality, cross-region replication, automated restore testing, backup monitoring, and recovery time objectives.',
  },
  {
    id: 'data-event-sourcing',
    category: 'data',
    title: 'Event Sourcing',
    description: 'Immutable event logs and temporal queries',
    prompt:
      'Based on the project context, evaluate event sourcing applicability. Consider event store design, snapshot strategies, projection rebuilding, event versioning, and temporal query capabilities for audit and debugging.',
  },

  // Testing Strategy prompts
  {
    id: 'test-pyramid-balance',
    category: 'testing',
    title: 'Testing Pyramid',
    description: 'Balance unit, integration, and E2E tests',
    prompt:
      'Based on the project context, audit test distribution across the testing pyramid. Consider ratio of unit to integration to E2E tests, execution time per layer, confidence gaps, and strategies to shift expensive E2E coverage to cheaper integration tests.',
  },
  {
    id: 'test-contract-testing',
    category: 'testing',
    title: 'Contract Testing',
    description: 'API compatibility between services',
    prompt:
      'Based on the project context, identify service boundaries with implicit contracts. Consider consumer-driven contract tests, provider verification, contract versioning, and breaking change detection before deployment.',
  },
  {
    id: 'test-load-testing',
    category: 'testing',
    title: 'Load Testing',
    description: 'Simulate peak traffic and find limits',
    prompt:
      'Based on the project context, evaluate performance testing practices. Consider load test scripting with tools like k6, realistic traffic patterns, performance baselines, regression detection in CI, and capacity limit documentation.',
  },
  {
    id: 'test-visual-regression',
    category: 'testing',
    title: 'Visual Regression',
    description: 'Screenshot comparison for UI changes',
    prompt:
      'Based on the project context, evaluate visual testing coverage. Consider screenshot comparison tools, component-level visual snapshots, responsive viewport testing, and visual diff review workflows.',
  },
  {
    id: 'test-mutation-testing',
    category: 'testing',
    title: 'Mutation Testing',
    description: 'Verify test suite effectiveness',
    prompt:
      'Based on the project context, evaluate test quality beyond code coverage percentage. Consider mutation testing tools, mutation score targets, survivor analysis, and using mutation results to write stronger assertions.',
  },
  {
    id: 'test-data-management',
    category: 'testing',
    title: 'Test Data Management',
    description: 'Factories, fixtures, and isolation',
    prompt:
      'Based on the project context, audit test data patterns. Consider factory libraries, database seeding, test isolation strategies, shared test data risks, and production-like test datasets without real PII.',
  },
  {
    id: 'test-flaky-tests',
    category: 'testing',
    title: 'Flaky Test Detection',
    description: 'Identify and quarantine unreliable tests',
    prompt:
      'Based on the project context, evaluate test reliability. Consider flaky test detection systems, quarantine mechanisms, retry policies, root cause categories like timing and state, and flakiness dashboards.',
  },
  {
    id: 'test-property-based',
    category: 'testing',
    title: 'Property-Based Testing',
    description: 'Generate random inputs to find edge cases',
    prompt:
      'Based on the project context, identify pure functions and parsers suitable for property testing. Consider property-based testing libraries like fast-check, shrinking strategies, custom generators, and integration with existing suites.',
  },
  {
    id: 'test-integration-strategy',
    category: 'testing',
    title: 'Integration Testing',
    description: 'Test real service interactions efficiently',
    prompt:
      'Based on the project context, evaluate integration test architecture. Consider test containers, in-memory substitutes, API mocking tools, database setup and teardown, and integration test execution time management.',
  },
  {
    id: 'test-coverage-strategy',
    category: 'testing',
    title: 'Coverage Strategy',
    description: 'Meaningful coverage targets and dead code',
    prompt:
      'Based on the project context, move beyond line coverage metrics. Consider branch coverage, critical path coverage mandates, coverage ratcheting to prevent decreases, dead code detection, and coverage-guided test prioritization.',
  },
];
