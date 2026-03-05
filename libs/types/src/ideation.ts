/**
 * Ideation types for AutoMaker brainstorming and idea management
 */

// ============================================================================
// Core Types
// ============================================================================

export type IdeaCategory =
  | 'feature'
  | 'ux-ui'
  | 'dx'
  | 'growth'
  | 'technical'
  | 'security'
  | 'performance'
  | 'accessibility'
  | 'analytics'
  | 'reliability'
  | 'devops'
  | 'data'
  | 'testing';
export type IdeaStatus = 'raw' | 'refined' | 'ready' | 'archived';
export type ImpactLevel = 'low' | 'medium' | 'high';
export type EffortLevel = 'low' | 'medium' | 'high';

// ============================================================================
// Idea Entity
// ============================================================================

export interface IdeaAttachment {
  id: string;
  type: 'image' | 'link' | 'reference';
  path?: string;
  url?: string;
  description?: string;
  [key: string]: unknown;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  impact: ImpactLevel;
  effort: EffortLevel;

  // Conversation context
  conversationId?: string;
  sourcePromptId?: string;

  // Content
  attachments?: IdeaAttachment[];
  userStories?: string[];
  notes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;

  // Extensibility
  [key: string]: unknown;
}

// ============================================================================
// Ideation Session
// ============================================================================

export type IdeationSessionStatus = 'active' | 'completed' | 'abandoned';

export interface IdeationSession {
  id: string;
  projectPath: string;
  promptCategory?: IdeaCategory;
  promptId?: string;
  status: IdeationSessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IdeationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  savedAsIdeaId?: string;
}

export interface IdeationSessionWithMessages extends IdeationSession {
  messages: IdeationMessage[];
}

// ============================================================================
// Guided Prompts
// ============================================================================

export interface PromptCategory {
  id: IdeaCategory;
  name: string;
  icon: string;
  description: string;
}

export interface IdeationPrompt {
  id: string;
  category: IdeaCategory;
  title: string;
  description: string;
  prompt: string;
  icon?: string;
  isCustom?: boolean;
}

// ============================================================================
// Custom Prompts
// ============================================================================

export interface CustomIdeationPrompt {
  id: string;
  title: string;
  prompt: string;
  category?: IdeaCategory;
  isTemplate: boolean;
  templateFields?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomPromptHistoryEntry {
  id: string;
  customPromptId?: string;
  promptText: string;
  category?: IdeaCategory;
  usedAt: string;
  suggestionsCount: number;
}

export interface EnhancePromptResult {
  original: string;
  enhanced: string;
}

export type EnhancePromptIntensity = 'refine' | 'expand' | 'structure';

export interface EnhancePromptOptions {
  projectPath: string;
  promptText: string;
  category?: IdeaCategory;
  intensity?: EnhancePromptIntensity;
  contextSources?: IdeationContextSources;
  customSystemPrompt?: string;
  model?: string;
  thinkingLevel?: string;
  enhancementMode?: import('./enhancement.js').EnhancementMode;
}

// ============================================================================
// Project Analysis
// ============================================================================

export interface AnalysisFileInfo {
  path: string;
  type: 'route' | 'component' | 'service' | 'model' | 'config' | 'test' | 'other';
  name: string;
}

export interface AnalysisSuggestion {
  id: string;
  category: IdeaCategory;
  title: string;
  description: string;
  rationale: string;
  relatedFiles?: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface ProjectAnalysisResult {
  projectPath: string;
  analyzedAt: string;

  // Structure analysis
  totalFiles: number;
  routes: AnalysisFileInfo[];
  components: AnalysisFileInfo[];
  services: AnalysisFileInfo[];

  // Tech stack detection
  framework?: string;
  language?: string;
  dependencies?: string[];

  // AI-generated suggestions
  suggestions: AnalysisSuggestion[];

  // Summary
  summary: string;
}

// ============================================================================
// API Types
// ============================================================================

export interface StartSessionOptions {
  promptId?: string;
  promptCategory?: IdeaCategory;
  initialMessage?: string;
}

export interface SendMessageOptions {
  imagePaths?: string[];
  model?: string;
}

export interface CreateIdeaInput {
  title: string;
  description: string;
  category: IdeaCategory;
  status?: IdeaStatus;
  impact?: ImpactLevel;
  effort?: EffortLevel;
  conversationId?: string;
  sourcePromptId?: string;
  userStories?: string[];
  notes?: string;
}

export interface UpdateIdeaInput {
  title?: string;
  description?: string;
  category?: IdeaCategory;
  status?: IdeaStatus;
  impact?: ImpactLevel;
  effort?: EffortLevel;
  userStories?: string[];
  notes?: string;
}

export interface ConvertToFeatureOptions {
  column?: string;
  dependencies?: string[];
  tags?: string[];
  keepIdea?: boolean;
}

// ============================================================================
// Event Types
// ============================================================================

export type IdeationEventType =
  | 'ideation:stream'
  | 'ideation:session-started'
  | 'ideation:session-ended'
  | 'ideation:analysis-started'
  | 'ideation:analysis-progress'
  | 'ideation:analysis-complete'
  | 'ideation:analysis-error';

export interface IdeationStreamEvent {
  type: 'ideation:stream';
  sessionId: string;
  content: string;
  done: boolean;
}

export interface IdeationAnalysisEvent {
  type:
    | 'ideation:analysis-started'
    | 'ideation:analysis-progress'
    | 'ideation:analysis-complete'
    | 'ideation:analysis-error';
  projectPath: string;
  progress?: number;
  message?: string;
  result?: ProjectAnalysisResult;
  error?: string;
}

// ============================================================================
// Context Sources Configuration
// ============================================================================

/**
 * Configuration for which context sources to include when generating ideas.
 * All values default to true for backward compatibility.
 */
export interface IdeationContextSources {
  /** Include .automaker/context/*.md|.txt files */
  useContextFiles: boolean;
  /** Include .automaker/memory/*.md files */
  useMemoryFiles: boolean;
  /** Include existing features from the board */
  useExistingFeatures: boolean;
  /** Include existing ideas from ideation */
  useExistingIdeas: boolean;
  /** Include app specification (.automaker/app_spec.txt) */
  useAppSpec: boolean;
}

/**
 * Default context sources configuration - all enabled for backward compatibility
 */
export const DEFAULT_IDEATION_CONTEXT_SOURCES: IdeationContextSources = {
  useContextFiles: true,
  useMemoryFiles: true,
  useExistingFeatures: true,
  useExistingIdeas: true,
  useAppSpec: true,
};
