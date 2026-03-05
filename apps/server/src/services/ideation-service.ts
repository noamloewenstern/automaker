/**
 * Ideation Service - Manages brainstorming sessions and ideas
 * Provides AI-powered ideation, project analysis, and idea-to-feature conversion
 */

import path from 'path';
import * as secureFs from '../lib/secure-fs.js';
import type { EventEmitter } from '../lib/events.js';
import type { Feature, ExecuteOptions } from '@automaker/types';
import type {
  Idea,
  IdeaCategory,
  IdeaStatus,
  IdeationSession,
  IdeationSessionWithMessages,
  IdeationMessage,
  ProjectAnalysisResult,
  AnalysisSuggestion,
  AnalysisFileInfo,
  CreateIdeaInput,
  UpdateIdeaInput,
  StartSessionOptions,
  SendMessageOptions,
  PromptCategory,
  IdeationPrompt,
  IdeationContextSources,
  CustomIdeationPrompt,
  CustomPromptHistoryEntry,
  EnhancePromptOptions,
  ThinkingLevel,
} from '@automaker/types';
import { DEFAULT_IDEATION_CONTEXT_SOURCES } from '@automaker/types';
import {
  getIdeasDir,
  getIdeaDir,
  getIdeaPath,
  getIdeationSessionsDir,
  getIdeationSessionPath,
  getIdeationAnalysisPath,
  getAppSpecPath,
  ensureIdeationDir,
  getCustomPromptsDir,
  getCustomPromptPath,
  getPromptHistoryPath,
} from '@automaker/platform';
import { extractXmlElements, extractImplementedFeatures } from '../lib/xml-extractor.js';
import { createLogger, loadContextFiles, isAbortError } from '@automaker/utils';
import { ProviderFactory } from '../providers/provider-factory.js';
import type { SettingsService } from './settings-service.js';
import type { FeatureLoader } from './feature-loader.js';
import { createChatOptions, validateWorkingDirectory } from '../lib/sdk-options.js';
import { resolveModelString, resolvePhaseModel } from '@automaker/model-resolver';
import {
  getSystemPrompt as getEnhancementSystemPrompt,
  isValidEnhancementMode,
  IDEATION_PROMPTS,
  IDEATION_CATEGORIES,
  IDEATION_CATEGORY_DESCRIPTIONS,
  IDEATION_CATEGORY_TYPE_MAPPING,
} from '@automaker/prompts';
import { stripProviderPrefix } from '@automaker/types';
import {
  getPromptCustomization,
  getProviderByModelId,
  getPhaseModelWithOverrides,
  getClaudeCodeExecutablePath,
  getClaudeCodeExtraArgs,
  getClaudeCodeEnvVars,
} from '../lib/settings-helpers.js';
import { setIdeationRunning, clearIdeationRunning } from '../routes/ideation/common.js';

const logger = createLogger('IdeationService');

const ENHANCE_CRITICAL_RULE = `CRITICAL: Your ENTIRE response must be ONLY the improved prompt in markdown. Do NOT output any preamble, thinking, commentary, explanations, or meta-text like "Here is...", "Let me...", or "I'll...". Start your response DIRECTLY with the prompt content.`;

const ENHANCE_INTENSITY_CONFIG: Record<
  string,
  { task: string; outputLabel: string; process: string; rules: string }
> = {
  expand: {
    task: "Expand the user's prompt into a comprehensive, well-structured specification that an AI coding agent can implement directly.",
    outputLabel: 'expanded',
    process: `Think step by step:
1. What is the core goal?
2. What are the functional requirements?
3. What technical approach makes sense?
4. What constraints should be explicit?
5. How will we know it's done?`,
    rules: `<output_format>
Structure the expanded prompt with these sections:
## Goal - One clear sentence describing the desired outcome.
## Requirements - Functional requirements as bullet points, each testable.
## Technical Approach - Suggested implementation strategy, key components/files.
## Constraints - What to avoid, performance/size limits, compatibility requirements.
## Acceptance Criteria - Concrete, verifiable conditions for "done".
</output_format>`,
  },
  structure: {
    task: "Reorganize the user's existing prompt content into a well-structured format. Do NOT add new requirements or change the scope — only improve the organization and clarity of what's already there.",
    outputLabel: 'restructured',
    process: `1. Read the entire prompt to understand all requirements mentioned
2. Group related requirements together
3. Add clear section headings
4. Convert prose into actionable bullet points
5. Add a role definition if missing
6. Ensure instructions are in logical order (context first, then requirements, then constraints)`,
    rules: `<rules>
- Preserve ALL original content and requirements — nothing should be lost
- Do NOT add new features, requirements, or scope
- Convert vague statements into clearer phrasing using the user's own words
- Use ## headings, bullet points, and numbered lists for structure
</rules>`,
  },
  refine: {
    task: "Polish and clarify the user's prompt. Improve clarity, specificity, and wording while preserving the original scope and intent.",
    outputLabel: 'improved',
    process: `1. Identify the core intent and scope of the prompt
2. Add an action verb if missing
3. Replace vague language with concrete technical terms
4. Add specificity where the prompt is ambiguous
5. Ensure the prompt specifies what "good output" looks like`,
    rules: `<rules>
- Keep approximately the same length — do NOT expand scope
- Preserve the user's voice and terminology
- Add concrete details only where the original is vague
- Format with ## headings and bullet points for clarity
- Every bullet should be actionable, not descriptive
</rules>`,
  },
};

function buildEnhanceSystemPrompt(
  intensity: string,
  categoryContext: string,
  projectContextSection: string
): string {
  const config = ENHANCE_INTENSITY_CONFIG[intensity] ?? ENHANCE_INTENSITY_CONFIG.refine;
  return `You are a senior prompt engineer specializing in AI coding agents.

<task>
${config.task}
</task>

${ENHANCE_CRITICAL_RULE}

<process>
${config.process}
</process>
${categoryContext}${projectContextSection}

${config.rules}

Return ONLY the ${config.outputLabel} prompt in markdown. No explanations or commentary.`;
}

interface ActiveSession {
  session: IdeationSession;
  messages: IdeationMessage[];
  isRunning: boolean;
  abortController: AbortController | null;
}

export class IdeationService {
  private activeSessions = new Map<string, ActiveSession>();
  private events: EventEmitter;
  private settingsService: SettingsService | null = null;
  private featureLoader: FeatureLoader | null = null;

  constructor(
    events: EventEmitter,
    settingsService?: SettingsService,
    featureLoader?: FeatureLoader
  ) {
    this.events = events;
    this.settingsService = settingsService ?? null;
    this.featureLoader = featureLoader ?? null;
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  /**
   * Start a new ideation session
   */
  async startSession(projectPath: string, options?: StartSessionOptions): Promise<IdeationSession> {
    validateWorkingDirectory(projectPath);
    await ensureIdeationDir(projectPath);

    const sessionId = this.generateId('session');
    const now = new Date().toISOString();

    const session: IdeationSession = {
      id: sessionId,
      projectPath,
      promptCategory: options?.promptCategory,
      promptId: options?.promptId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const activeSession: ActiveSession = {
      session,
      messages: [],
      isRunning: false,
      abortController: null,
    };

    this.activeSessions.set(sessionId, activeSession);
    await this.saveSessionToDisk(projectPath, session, []);

    this.events.emit('ideation:session-started', { sessionId, projectPath });

    // If there's an initial message from a prompt, send it
    if (options?.initialMessage) {
      await this.sendMessage(sessionId, options.initialMessage);
    }

    return session;
  }

  /**
   * Get an existing session
   */
  async getSession(
    projectPath: string,
    sessionId: string
  ): Promise<IdeationSessionWithMessages | null> {
    // Check if session is already active in memory
    let activeSession = this.activeSessions.get(sessionId);

    if (!activeSession) {
      // Try to load from disk
      const loaded = await this.loadSessionFromDisk(projectPath, sessionId);
      if (!loaded) return null;

      activeSession = {
        session: loaded.session,
        messages: loaded.messages,
        isRunning: false,
        abortController: null,
      };
      this.activeSessions.set(sessionId, activeSession);
    }

    return {
      ...activeSession.session,
      messages: activeSession.messages,
    };
  }

  /**
   * Send a message in an ideation session
   */
  async sendMessage(
    sessionId: string,
    message: string,
    options?: SendMessageOptions
  ): Promise<void> {
    const activeSession = this.activeSessions.get(sessionId);
    if (!activeSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (activeSession.isRunning) {
      throw new Error('Session is already processing a message');
    }

    activeSession.isRunning = true;
    activeSession.abortController = new AbortController();

    // Add user message
    const userMessage: IdeationMessage = {
      id: this.generateId('msg'),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    activeSession.messages.push(userMessage);

    // Emit user message
    this.events.emit('ideation:stream', {
      sessionId,
      type: 'message',
      message: userMessage,
    });

    try {
      const projectPath = activeSession.session.projectPath;

      // Build conversation history
      const conversationHistory = activeSession.messages.slice(0, -1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Load context files
      const contextResult = await loadContextFiles({
        projectPath,
        fsModule: secureFs as Parameters<typeof loadContextFiles>[0]['fsModule'],
      });

      // Gather existing features and ideas to prevent duplicate suggestions
      const existingWorkContext = await this.gatherExistingWorkContext(projectPath);

      // Get customized prompts from settings
      const prompts = await getPromptCustomization(this.settingsService, '[IdeationService]');

      // Build system prompt for ideation
      const systemPrompt = this.buildIdeationSystemPrompt(
        prompts.ideation.ideationSystemPrompt,
        contextResult.formattedPrompt,
        activeSession.session.promptCategory,
        existingWorkContext
      );

      // Resolve model alias to canonical identifier (with prefix)
      let modelId = resolveModelString(options?.model ?? 'sonnet');

      // Try to find a provider for this model (e.g., GLM, MiniMax models)
      let claudeCompatibleProvider: import('@automaker/types').ClaudeCompatibleProvider | undefined;
      let credentials = await this.settingsService?.getCredentials();
      const claudeCodeExecutablePath = await getClaudeCodeExecutablePath(this.settingsService);
      const claudeCodeExtraArgs = await getClaudeCodeExtraArgs(this.settingsService);
      const claudeCodeEnvVars = await getClaudeCodeEnvVars(this.settingsService);

      if (this.settingsService && options?.model) {
        const providerResult = await getProviderByModelId(
          options.model,
          this.settingsService,
          '[IdeationService]'
        );
        if (providerResult.provider) {
          claudeCompatibleProvider = providerResult.provider;
          // CRITICAL: For custom providers, use the provider's model ID (e.g. "GLM-4.7")
          // for the API call, NOT the resolved Claude model - otherwise we get "model not found"
          modelId = options.model;
          credentials = providerResult.credentials ?? credentials;
        }
      }

      // Create SDK options
      const sdkOptions = createChatOptions({
        cwd: projectPath,
        model: modelId,
        systemPrompt,
        abortController: activeSession.abortController!,
      });

      const provider = ProviderFactory.getProviderForModel(modelId);

      // Strip provider prefix - providers need bare model IDs
      const bareModel = stripProviderPrefix(modelId);

      const executeOptions: ExecuteOptions = {
        prompt: message,
        model: bareModel,
        originalModel: modelId,
        cwd: projectPath,
        systemPrompt: sdkOptions.systemPrompt,
        maxTurns: 1, // Single turn for ideation
        abortController: activeSession.abortController!,
        conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
        claudeCompatibleProvider, // Pass provider for alternative endpoint configuration
        credentials, // Pass credentials for resolving 'credentials' apiKeySource
        claudeCodeExecutablePath, // Pass custom Claude Code executable path
        claudeCodeExtraArgs, // Pass extra CLI flags
        claudeCodeEnvVars, // Pass extra env vars
      };

      const stream = provider.executeQuery(executeOptions);

      let responseText = '';
      const assistantMessage: IdeationMessage = {
        id: this.generateId('msg'),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      for await (const msg of stream) {
        if (msg.type === 'assistant' && msg.message?.content) {
          for (const block of msg.message.content) {
            if (block.type === 'text') {
              responseText += block.text;
              assistantMessage.content = responseText;

              this.events.emit('ideation:stream', {
                sessionId,
                type: 'stream',
                content: responseText,
                done: false,
              });
            }
          }
        } else if (msg.type === 'result') {
          if (msg.subtype === 'success' && msg.result) {
            assistantMessage.content = msg.result;
            responseText = msg.result;
          }
        }
      }

      activeSession.messages.push(assistantMessage);

      this.events.emit('ideation:stream', {
        sessionId,
        type: 'message-complete',
        message: assistantMessage,
        content: responseText,
        done: true,
      });

      // Save session
      await this.saveSessionToDisk(projectPath, activeSession.session, activeSession.messages);
    } catch (error) {
      if (isAbortError(error)) {
        this.events.emit('ideation:stream', {
          sessionId,
          type: 'aborted',
        });
      } else {
        logger.error('Error in ideation message:', error);
        this.events.emit('ideation:stream', {
          sessionId,
          type: 'error',
          error: (error as Error).message,
        });
      }
    } finally {
      activeSession.isRunning = false;
      activeSession.abortController = null;
    }
  }

  /**
   * Stop an active session
   */
  async stopSession(sessionId: string): Promise<void> {
    const activeSession = this.activeSessions.get(sessionId);
    if (!activeSession) return;

    if (activeSession.abortController) {
      activeSession.abortController.abort();
    }

    activeSession.isRunning = false;
    activeSession.abortController = null;
    activeSession.session.status = 'completed';

    await this.saveSessionToDisk(
      activeSession.session.projectPath,
      activeSession.session,
      activeSession.messages
    );

    this.events.emit('ideation:session-ended', { sessionId });
  }

  // ============================================================================
  // Ideas CRUD
  // ============================================================================

  /**
   * Create a new idea
   */
  async createIdea(projectPath: string, input: CreateIdeaInput): Promise<Idea> {
    validateWorkingDirectory(projectPath);
    await ensureIdeationDir(projectPath);

    const ideaId = this.generateId('idea');
    const now = new Date().toISOString();

    const idea: Idea = {
      id: ideaId,
      title: input.title,
      description: input.description,
      category: input.category,
      status: input.status || 'raw',
      impact: input.impact || 'medium',
      effort: input.effort || 'medium',
      conversationId: input.conversationId,
      sourcePromptId: input.sourcePromptId,
      userStories: input.userStories,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    // Save to disk
    const ideaDir = getIdeaDir(projectPath, ideaId);
    await secureFs.mkdir(ideaDir, { recursive: true });
    await secureFs.writeFile(
      getIdeaPath(projectPath, ideaId),
      JSON.stringify(idea, null, 2),
      'utf-8'
    );

    return idea;
  }

  /**
   * Get all ideas for a project
   */
  async getIdeas(projectPath: string): Promise<Idea[]> {
    try {
      const ideasDir = getIdeasDir(projectPath);

      try {
        await secureFs.access(ideasDir);
      } catch {
        return [];
      }

      const entries = (await secureFs.readdir(ideasDir, {
        withFileTypes: true,
      })) as import('fs').Dirent[];
      const ideaDirs = entries.filter((entry) => entry.isDirectory());

      const ideas: Idea[] = [];
      for (const dir of ideaDirs) {
        try {
          const ideaPath = getIdeaPath(projectPath, dir.name);
          const content = (await secureFs.readFile(ideaPath, 'utf-8')) as string;
          ideas.push(JSON.parse(content));
        } catch (error) {
          logger.warn(`Failed to load idea ${dir.name}:`, error);
        }
      }

      // Sort by updatedAt descending
      return ideas.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      logger.error('Failed to get ideas:', error);
      return [];
    }
  }

  /**
   * Get a single idea
   */
  async getIdea(projectPath: string, ideaId: string): Promise<Idea | null> {
    try {
      const ideaPath = getIdeaPath(projectPath, ideaId);
      const content = (await secureFs.readFile(ideaPath, 'utf-8')) as string;
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Update an idea
   */
  async updateIdea(
    projectPath: string,
    ideaId: string,
    updates: UpdateIdeaInput
  ): Promise<Idea | null> {
    const idea = await this.getIdea(projectPath, ideaId);
    if (!idea) return null;

    const updatedIdea: Idea = {
      ...idea,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await secureFs.writeFile(
      getIdeaPath(projectPath, ideaId),
      JSON.stringify(updatedIdea, null, 2),
      'utf-8'
    );

    return updatedIdea;
  }

  /**
   * Delete an idea
   */
  async deleteIdea(projectPath: string, ideaId: string): Promise<void> {
    const ideaDir = getIdeaDir(projectPath, ideaId);
    try {
      await secureFs.rm(ideaDir, { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
  }

  /**
   * Archive an idea
   */
  async archiveIdea(projectPath: string, ideaId: string): Promise<Idea | null> {
    return this.updateIdea(projectPath, ideaId, {
      status: 'archived' as IdeaStatus,
    });
  }

  // ============================================================================
  // Project Analysis
  // ============================================================================

  /**
   * Analyze project structure and generate suggestions
   */
  async analyzeProject(projectPath: string): Promise<ProjectAnalysisResult> {
    validateWorkingDirectory(projectPath);
    await ensureIdeationDir(projectPath);

    this.emitAnalysisEvent('ideation:analysis-started', {
      projectPath,
      message: 'Starting project analysis...',
    });

    setIdeationRunning(projectPath, 'analysis', 'Analyzing project structure');

    try {
      // Gather project structure
      const structure = await this.gatherProjectStructure(projectPath);

      this.emitAnalysisEvent('ideation:analysis-progress', {
        projectPath,
        progress: 30,
        message: 'Analyzing codebase structure...',
      });

      // Use AI to generate suggestions
      const suggestions = await this.generateAnalysisSuggestions(projectPath, structure);

      this.emitAnalysisEvent('ideation:analysis-progress', {
        projectPath,
        progress: 80,
        message: 'Generating improvement suggestions...',
      });

      const result: ProjectAnalysisResult = {
        projectPath,
        analyzedAt: new Date().toISOString(),
        totalFiles: structure.totalFiles,
        routes: structure.routes,
        components: structure.components,
        services: structure.services,
        framework: structure.framework,
        language: structure.language,
        dependencies: structure.dependencies,
        suggestions,
        summary: this.generateAnalysisSummary(structure, suggestions),
      };

      // Cache the result
      await secureFs.writeFile(
        getIdeationAnalysisPath(projectPath),
        JSON.stringify(result, null, 2),
        'utf-8'
      );

      this.emitAnalysisEvent('ideation:analysis-complete', {
        projectPath,
        result,
      });

      clearIdeationRunning(projectPath, 'analysis');
      return result;
    } catch (error) {
      clearIdeationRunning(projectPath, 'analysis');
      logger.error('Project analysis failed:', error);
      this.emitAnalysisEvent('ideation:analysis-error', {
        projectPath,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Emit analysis event wrapped in ideation:analysis format
   */
  private emitAnalysisEvent(eventType: string, data: Record<string, unknown>): void {
    this.events.emit('ideation:analysis', {
      type: eventType,
      ...data,
    });
  }

  /**
   * Check if a session is currently running (processing a message)
   */
  isSessionRunning(sessionId: string): boolean {
    const activeSession = this.activeSessions.get(sessionId);
    return activeSession?.isRunning ?? false;
  }

  /**
   * Get cached analysis result
   */
  async getCachedAnalysis(projectPath: string): Promise<ProjectAnalysisResult | null> {
    try {
      const content = (await secureFs.readFile(
        getIdeationAnalysisPath(projectPath),
        'utf-8'
      )) as string;
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  // ============================================================================
  // Convert to Feature
  // ============================================================================

  /**
   * Convert an idea to a feature
   */
  async convertToFeature(projectPath: string, ideaId: string): Promise<Feature> {
    const idea = await this.getIdea(projectPath, ideaId);
    if (!idea) {
      throw new Error(`Idea ${ideaId} not found`);
    }

    // Build feature description from idea
    let description = idea.description;
    if (idea.userStories && idea.userStories.length > 0) {
      description += '\n\n## User Stories\n' + idea.userStories.map((s) => `- ${s}`).join('\n');
    }
    if (idea.notes) {
      description += '\n\n## Notes\n' + idea.notes;
    }

    const feature: Feature = {
      id: this.generateId('feature'),
      title: idea.title,
      category: this.mapSuggestionCategoryToFeatureCategory(idea.category),
      description,
      status: 'backlog',
    };

    return feature;
  }

  // ============================================================================
  // Generate Suggestions
  // ============================================================================

  /**
   * Generate structured suggestions for a prompt.
   * Returns parsed suggestions that can be directly added to the board.
   *
   * When both `customPromptText` and `promptId` are provided, `customPromptText`
   * takes priority and `promptId` is ignored for prompt resolution.
   * Custom prompt usage (via either parameter) is recorded in prompt history.
   */
  async generateSuggestions(
    projectPath: string,
    promptId: string | null,
    category: IdeaCategory,
    count: number = 10,
    contextSources?: IdeationContextSources,
    customPromptText?: string
  ): Promise<AnalysisSuggestion[]> {
    const suggestionCount = Math.min(Math.max(Math.floor(count ?? 10), 1), 20);
    // Merge with defaults for backward compatibility
    const sources = { ...DEFAULT_IDEATION_CONTEXT_SOURCES, ...contextSources };
    validateWorkingDirectory(projectPath);

    // Resolve prompt text
    let promptText: string;
    let promptTitle: string;

    if (customPromptText) {
      // Use custom prompt text directly
      promptText = customPromptText;
      promptTitle = 'Custom prompt';
    } else if (promptId && promptId.startsWith('custom-')) {
      // Load saved custom prompt from disk
      if (promptId.includes('..') || promptId.includes('/') || promptId.includes('\\')) {
        throw new Error('Invalid prompt ID');
      }
      const customPrompt = await this.getCustomPrompt(projectPath, promptId);
      if (!customPrompt) {
        throw new Error(`Custom prompt ${promptId} not found`);
      }
      promptText = customPrompt.prompt;
      promptTitle = customPrompt.title;
    } else if (promptId) {
      // Look up predefined prompt
      const prompt = this.getAllPrompts().find((p) => p.id === promptId);
      if (!prompt) {
        throw new Error(`Prompt ${promptId} not found`);
      }
      promptText = prompt.prompt;
      promptTitle = prompt.title;
    } else {
      throw new Error('Either promptId or customPromptText is required');
    }

    // Emit start event
    this.events.emit('ideation:suggestions', {
      type: 'started',
      promptId,
      category,
    });

    setIdeationRunning(projectPath, 'suggestions', promptTitle);

    try {
      // Load context files (respecting toggle settings)
      const contextResult = await loadContextFiles({
        projectPath,
        fsModule: secureFs as Parameters<typeof loadContextFiles>[0]['fsModule'],
        includeContextFiles: sources.useContextFiles,
        includeMemory: sources.useMemoryFiles,
      });

      // Build context from multiple sources
      let contextPrompt = contextResult.formattedPrompt;

      // Add app spec context if enabled
      if (sources.useAppSpec) {
        const appSpecContext = await this.buildAppSpecContext(projectPath);
        if (appSpecContext) {
          contextPrompt = contextPrompt ? `${contextPrompt}\n\n${appSpecContext}` : appSpecContext;
        }
      }

      // If no context was found, try to gather basic project info
      if (!contextPrompt) {
        const projectInfo = await this.gatherBasicProjectInfo(projectPath);
        if (projectInfo) {
          contextPrompt = projectInfo;
        }
      }

      // Gather existing features and ideas to prevent duplicates (respecting toggle settings)
      const existingWorkContext = await this.gatherExistingWorkContext(projectPath, {
        includeFeatures: sources.useExistingFeatures,
        includeIdeas: sources.useExistingIdeas,
      });

      // Get customized prompts from settings
      const prompts = await getPromptCustomization(this.settingsService, '[IdeationService]');

      // Build system prompt for structured suggestions
      const systemPrompt = this.buildSuggestionsSystemPrompt(
        prompts.ideation.suggestionsSystemPrompt,
        contextPrompt,
        category,
        suggestionCount,
        existingWorkContext
      );

      // Get model from phase settings with provider info (ideationModel)
      const phaseResult = await getPhaseModelWithOverrides(
        'ideationModel',
        this.settingsService,
        projectPath,
        '[IdeationService]'
      );
      const resolved = resolvePhaseModel(phaseResult.phaseModel);
      // resolvePhaseModel already resolves model aliases internally - no need to call resolveModelString again
      const modelId = resolved.model;
      const claudeCompatibleProvider = phaseResult.provider;
      const credentials = phaseResult.credentials;
      const suggestionsClaudeCodeExecutablePath = await getClaudeCodeExecutablePath(
        this.settingsService
      );
      const suggestionsClaudeCodeExtraArgs = await getClaudeCodeExtraArgs(this.settingsService);
      const suggestionsClaudeCodeEnvVars = await getClaudeCodeEnvVars(this.settingsService);

      logger.info(
        'generateSuggestions using model:',
        modelId,
        claudeCompatibleProvider ? `via provider: ${claudeCompatibleProvider.name}` : 'direct API'
      );

      // Create SDK options
      const sdkOptions = createChatOptions({
        cwd: projectPath,
        model: modelId,
        systemPrompt,
        abortController: new AbortController(),
      });

      const provider = ProviderFactory.getProviderForModel(modelId);

      // Strip provider prefix - providers need bare model IDs
      const bareModel = stripProviderPrefix(modelId);

      const executeOptions: ExecuteOptions = {
        prompt: promptText,
        model: bareModel,
        originalModel: modelId,
        cwd: projectPath,
        systemPrompt: sdkOptions.systemPrompt,
        maxTurns: 1,
        // Disable all tools - we just want text generation, not codebase analysis
        allowedTools: [],
        abortController: new AbortController(),
        readOnly: true, // Suggestions only need to return JSON, never write files
        thinkingLevel: resolved.thinkingLevel,
        claudeCompatibleProvider, // Pass provider for alternative endpoint configuration
        credentials, // Pass credentials for resolving 'credentials' apiKeySource
        claudeCodeExecutablePath: suggestionsClaudeCodeExecutablePath, // Pass custom Claude Code executable path
        claudeCodeExtraArgs: suggestionsClaudeCodeExtraArgs, // Pass extra CLI flags
        claudeCodeEnvVars: suggestionsClaudeCodeEnvVars, // Pass extra env vars
      };

      const stream = provider.executeQuery(executeOptions);

      let responseText = '';
      for await (const msg of stream) {
        if (msg.type === 'assistant' && msg.message?.content) {
          for (const block of msg.message.content) {
            if (block.type === 'text') {
              responseText += block.text;
            }
          }
        } else if (msg.type === 'result' && msg.subtype === 'success' && msg.result) {
          responseText = msg.result;
        }
      }

      // Parse the response into structured suggestions
      const suggestions = this.parseSuggestionsFromResponse(
        responseText,
        category,
        suggestionCount
      );

      // Track custom prompt usage in history
      if (customPromptText || (promptId && promptId.startsWith('custom-'))) {
        try {
          await this.addToPromptHistory(projectPath, {
            customPromptId: promptId?.startsWith('custom-') ? promptId : undefined,
            promptText: promptText,
            category,
            usedAt: new Date().toISOString(),
            suggestionsCount: suggestions.length,
          });
        } catch (error) {
          logger.warn('Failed to save prompt history:', error);
        }
      }

      // Emit complete event
      this.events.emit('ideation:suggestions', {
        type: 'complete',
        promptId,
        category,
        suggestions,
      });

      clearIdeationRunning(projectPath, 'suggestions');
      return suggestions;
    } catch (error) {
      clearIdeationRunning(projectPath, 'suggestions');
      logger.error('Failed to generate suggestions:', error);
      this.events.emit('ideation:suggestions', {
        type: 'error',
        promptId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Build system prompt for structured suggestion generation
   * @param basePrompt - The base system prompt from settings
   * @param contextFilesPrompt - Project context from loaded files
   * @param category - The idea category to focus on
   * @param count - Number of suggestions to generate
   * @param existingWorkContext - Context about existing features/ideas
   */
  private buildSuggestionsSystemPrompt(
    basePrompt: string,
    contextFilesPrompt: string | undefined,
    category: IdeaCategory,
    count: number = 10,
    existingWorkContext?: string
  ): string {
    const contextSection = contextFilesPrompt
      ? `## Project Context\n${contextFilesPrompt}`
      : `## No Project Context Available\nNo context files were found. Generate suggestions based on the user's prompt and general best practices for the type of application being described.`;

    const existingWorkSection = existingWorkContext ? `\n\n${existingWorkContext}` : '';

    // Replace placeholder {{count}} if present, otherwise append count instruction
    let prompt = basePrompt;
    if (prompt.includes('{{count}}')) {
      prompt = prompt.replace(/\{\{count\}\}/g, String(count));
    } else {
      prompt += `\n\nGenerate exactly ${count} suggestions.`;
    }

    return `${prompt}

Focus area: ${this.getCategoryDescription(category)}

${contextSection}${existingWorkSection}`;
  }

  /**
   * Parse AI response into structured suggestions
   */
  private parseSuggestionsFromResponse(
    response: string,
    category: IdeaCategory,
    count: number
  ): AnalysisSuggestion[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        logger.warn('No JSON array found in response, falling back to text parsing');
        return this.parseTextResponse(response, category, count);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed)) {
        return this.parseTextResponse(response, category, count);
      }

      return parsed
        .map(
          (
            item: {
              title?: string;
              description?: string;
              rationale?: string;
              priority?: 'low' | 'medium' | 'high';
              relatedFiles?: string[];
            },
            index: number
          ) => ({
            id: this.generateId('sug'),
            category,
            title: item.title || `Suggestion ${index + 1}`,
            description: item.description || '',
            rationale: item.rationale || '',
            priority: item.priority || ('medium' as const),
            relatedFiles: item.relatedFiles || [],
          })
        )
        .slice(0, count);
    } catch (error) {
      logger.warn('Failed to parse JSON response:', error);
      return this.parseTextResponse(response, category, count);
    }
  }

  /**
   * Fallback: parse text response into suggestions
   */
  private parseTextResponse(
    response: string,
    category: IdeaCategory,
    count: number
  ): AnalysisSuggestion[] {
    const suggestions: AnalysisSuggestion[] = [];

    // Try to find numbered items or headers
    const lines = response.split('\n');
    let currentSuggestion: Partial<AnalysisSuggestion> | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check for numbered items or markdown headers
      const titleMatch = line.match(/^(?:\d+[.)]\s*\*{0,2}|#{1,3}\s+)(.+)/);

      if (titleMatch) {
        // Save previous suggestion
        if (currentSuggestion && currentSuggestion.title) {
          suggestions.push({
            id: this.generateId('sug'),
            category,
            title: currentSuggestion.title,
            description: currentContent.join(' ').trim() || currentSuggestion.title,
            rationale: '',
            priority: 'medium',
            ...currentSuggestion,
          } as AnalysisSuggestion);
        }

        // Start new suggestion
        currentSuggestion = {
          title: titleMatch[1].replace(/\*{1,2}/g, '').trim(),
        };
        currentContent = [];
      } else if (currentSuggestion && line.trim()) {
        currentContent.push(line.trim());
      }
    }

    // Don't forget the last suggestion
    if (currentSuggestion && currentSuggestion.title) {
      suggestions.push({
        id: this.generateId('sug'),
        category,
        title: currentSuggestion.title,
        description: currentContent.join(' ').trim() || currentSuggestion.title,
        rationale: '',
        priority: 'medium',
      } as AnalysisSuggestion);
    }

    // If no suggestions found, create one from the whole response
    if (suggestions.length === 0 && response.trim()) {
      suggestions.push({
        id: this.generateId('sug'),
        category,
        title: 'AI Suggestion',
        description: response.slice(0, 500),
        rationale: '',
        priority: 'medium',
      });
    }

    return suggestions.slice(0, count);
  }

  // ============================================================================
  // Guided Prompts
  // ============================================================================

  /**
   * Get all prompt categories
   */
  getPromptCategories(): PromptCategory[] {
    return IDEATION_CATEGORIES;
  }

  /**
   * Get prompts for a specific category
   */
  getPromptsByCategory(category: IdeaCategory): IdeationPrompt[] {
    const allPrompts = this.getAllPrompts();
    return allPrompts.filter((p) => p.category === category);
  }

  /**
   * Get all guided prompts
   * This is the single source of truth for guided prompts data.
   * Frontend fetches this data via /api/ideation/prompts endpoint.
   */
  getAllPrompts(): IdeationPrompt[] {
    return IDEATION_PROMPTS;
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private buildIdeationSystemPrompt(
    basePrompt: string,
    contextFilesPrompt: string | undefined,
    category?: IdeaCategory,
    existingWorkContext?: string
  ): string {
    const categoryContext = category
      ? `\n\nFocus area: ${this.getCategoryDescription(category)}`
      : '';

    const contextSection = contextFilesPrompt
      ? `\n\n## Project Context\n${contextFilesPrompt}`
      : '';

    const existingWorkSection = existingWorkContext ? `\n\n${existingWorkContext}` : '';

    return basePrompt + categoryContext + contextSection + existingWorkSection;
  }

  private getCategoryDescription(category: IdeaCategory): string {
    return IDEATION_CATEGORY_DESCRIPTIONS[category] || '';
  }

  /**
   * Build context from app_spec.txt for suggestion generation
   * Extracts project name, overview, capabilities, and implemented features
   */
  private async buildAppSpecContext(projectPath: string): Promise<string> {
    try {
      const specPath = getAppSpecPath(projectPath);
      const specContent = (await secureFs.readFile(specPath, 'utf-8')) as string;

      const parts: string[] = [];
      parts.push('## App Specification');

      // Extract project name
      const projectNames = extractXmlElements(specContent, 'project_name');
      if (projectNames.length > 0 && projectNames[0]) {
        parts.push(`**Project:** ${projectNames[0]}`);
      }

      // Extract overview
      const overviews = extractXmlElements(specContent, 'overview');
      if (overviews.length > 0 && overviews[0]) {
        parts.push(`**Overview:** ${overviews[0]}`);
      }

      // Extract core capabilities
      const capabilities = extractXmlElements(specContent, 'capability');
      if (capabilities.length > 0) {
        parts.push('**Core Capabilities:**');
        for (const cap of capabilities) {
          parts.push(`- ${cap}`);
        }
      }

      // Extract implemented features
      const implementedFeatures = extractImplementedFeatures(specContent);
      if (implementedFeatures.length > 0) {
        parts.push('**Implemented Features:**');
        for (const feature of implementedFeatures) {
          if (feature.description) {
            parts.push(`- ${feature.name}: ${feature.description}`);
          } else {
            parts.push(`- ${feature.name}`);
          }
        }
      }

      // Only return content if we extracted something meaningful
      if (parts.length > 1) {
        return parts.join('\n');
      }
      return '';
    } catch (error) {
      // If file doesn't exist, return empty string silently
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return '';
      }
      // For other errors, log and return empty string
      logger.warn('Failed to build app spec context:', error);
      return '';
    }
  }

  /**
   * Gather basic project information for context when no context files exist
   */
  private async gatherBasicProjectInfo(projectPath: string): Promise<string | null> {
    const parts: string[] = [];

    // Try to read package.json
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const content = (await secureFs.readFile(packageJsonPath, 'utf-8')) as string;
      const pkg = JSON.parse(content);

      parts.push('## Project Information (from package.json)');
      if (pkg.name) parts.push(`**Name:** ${pkg.name}`);
      if (pkg.description) parts.push(`**Description:** ${pkg.description}`);
      if (pkg.version) parts.push(`**Version:** ${pkg.version}`);

      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const depNames = Object.keys(allDeps);

      // Detect framework and language
      let framework = 'Unknown';
      if (allDeps.react) framework = allDeps.next ? 'Next.js' : 'React';
      else if (allDeps.vue) framework = allDeps.nuxt ? 'Nuxt' : 'Vue';
      else if (allDeps['@angular/core']) framework = 'Angular';
      else if (allDeps.svelte) framework = 'Svelte';
      else if (allDeps.express) framework = 'Express';
      else if (allDeps.fastify) framework = 'Fastify';
      else if (allDeps.koa) framework = 'Koa';

      const language = allDeps.typescript ? 'TypeScript' : 'JavaScript';
      parts.push(`**Tech Stack:** ${framework} with ${language}`);

      // Key dependencies
      const keyDeps = depNames
        .filter(
          (d) => !d.startsWith('@types/') && !['typescript', 'eslint', 'prettier'].includes(d)
        )
        .slice(0, 15);
      if (keyDeps.length > 0) {
        parts.push(`**Key Dependencies:** ${keyDeps.join(', ')}`);
      }

      // Scripts
      if (pkg.scripts) {
        const scriptNames = Object.keys(pkg.scripts).slice(0, 10);
        parts.push(`**Available Scripts:** ${scriptNames.join(', ')}`);
      }
    } catch {
      // No package.json, try other files
    }

    // Try to read README.md (first 500 chars)
    try {
      const readmePath = path.join(projectPath, 'README.md');
      const content = (await secureFs.readFile(readmePath, 'utf-8')) as string;
      if (content) {
        parts.push('\n## README.md (excerpt)');
        parts.push(content.slice(0, 1000));
      }
    } catch {
      // No README
    }

    // Try to get cached analysis
    const cachedAnalysis = await this.getCachedAnalysis(projectPath);
    if (cachedAnalysis) {
      parts.push('\n## Project Structure Analysis');
      parts.push(cachedAnalysis.summary || '');
      if (cachedAnalysis.routes && cachedAnalysis.routes.length > 0) {
        parts.push(`**Routes:** ${cachedAnalysis.routes.map((r) => r.name).join(', ')}`);
      }
      if (cachedAnalysis.components && cachedAnalysis.components.length > 0) {
        parts.push(
          `**Components:** ${cachedAnalysis.components
            .slice(0, 10)
            .map((c) => c.name)
            .join(
              ', '
            )}${cachedAnalysis.components.length > 10 ? ` and ${cachedAnalysis.components.length - 10} more` : ''}`
        );
      }
    }

    if (parts.length === 0) {
      return null;
    }

    return parts.join('\n');
  }

  /**
   * Gather existing features and ideas to prevent duplicate suggestions
   * Returns a concise list of titles grouped by status to avoid polluting context
   */
  private async gatherExistingWorkContext(
    projectPath: string,
    options?: { includeFeatures?: boolean; includeIdeas?: boolean }
  ): Promise<string> {
    const { includeFeatures = true, includeIdeas = true } = options ?? {};
    const parts: string[] = [];

    // Load existing features from the board
    if (includeFeatures && this.featureLoader) {
      try {
        const features = await this.featureLoader.getAll(projectPath);
        if (features.length > 0) {
          parts.push('## Existing Features (Do NOT regenerate these)');
          parts.push(
            'The following features already exist on the board. Do NOT suggest similar ideas:\n'
          );

          // Group features by status for clarity
          const byStatus: Record<string, string[]> = {
            done: [],
            'in-review': [],
            'in-progress': [],
            backlog: [],
          };

          for (const feature of features) {
            const status = feature.status || 'backlog';
            const title = feature.title || 'Untitled';
            if (byStatus[status]) {
              byStatus[status].push(title);
            } else {
              byStatus['backlog'].push(title);
            }
          }

          // Output completed features first (most important to not duplicate)
          if (byStatus['done'].length > 0) {
            parts.push(`**Completed:** ${byStatus['done'].join(', ')}`);
          }
          if (byStatus['in-review'].length > 0) {
            parts.push(`**In Review:** ${byStatus['in-review'].join(', ')}`);
          }
          if (byStatus['in-progress'].length > 0) {
            parts.push(`**In Progress:** ${byStatus['in-progress'].join(', ')}`);
          }
          if (byStatus['backlog'].length > 0) {
            parts.push(`**Backlog:** ${byStatus['backlog'].join(', ')}`);
          }
          parts.push('');
        }
      } catch (error) {
        logger.warn('Failed to load existing features:', error);
      }
    }

    // Load existing ideas
    if (includeIdeas) {
      try {
        const ideas = await this.getIdeas(projectPath);
        // Filter out archived ideas
        const activeIdeas = ideas.filter((idea) => idea.status !== 'archived');

        if (activeIdeas.length > 0) {
          parts.push('## Existing Ideas (Do NOT regenerate these)');
          parts.push(
            'The following ideas have already been captured. Do NOT suggest similar ideas:\n'
          );

          // Group by category for organization
          const byCategory: Record<string, string[]> = {};
          for (const idea of activeIdeas) {
            const cat = idea.category || 'feature';
            if (!byCategory[cat]) {
              byCategory[cat] = [];
            }
            byCategory[cat].push(idea.title);
          }

          for (const [category, titles] of Object.entries(byCategory)) {
            parts.push(`**${category}:** ${titles.join(', ')}`);
          }
          parts.push('');
        }
      } catch (error) {
        logger.warn('Failed to load existing ideas:', error);
      }
    }

    return parts.join('\n');
  }

  private async gatherProjectStructure(projectPath: string): Promise<{
    totalFiles: number;
    routes: AnalysisFileInfo[];
    components: AnalysisFileInfo[];
    services: AnalysisFileInfo[];
    framework?: string;
    language?: string;
    dependencies?: string[];
  }> {
    const routes: AnalysisFileInfo[] = [];
    const components: AnalysisFileInfo[] = [];
    const services: AnalysisFileInfo[] = [];
    let totalFiles = 0;
    let framework: string | undefined;
    let language: string | undefined;
    const dependencies: string[] = [];

    // Check for package.json to detect framework and dependencies
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const content = (await secureFs.readFile(packageJsonPath, 'utf-8')) as string;
      const pkg = JSON.parse(content);

      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      dependencies.push(...Object.keys(allDeps).slice(0, 20)); // Top 20 deps

      if (allDeps.react) framework = 'React';
      else if (allDeps.vue) framework = 'Vue';
      else if (allDeps.angular) framework = 'Angular';
      else if (allDeps.next) framework = 'Next.js';
      else if (allDeps.express) framework = 'Express';

      language = allDeps.typescript ? 'TypeScript' : 'JavaScript';
    } catch {
      // No package.json
    }

    // Scan common directories
    const scanPatterns = [
      { dir: 'src/routes', type: 'route' as const },
      { dir: 'src/pages', type: 'route' as const },
      { dir: 'app', type: 'route' as const },
      { dir: 'src/components', type: 'component' as const },
      { dir: 'components', type: 'component' as const },
      { dir: 'src/services', type: 'service' as const },
      { dir: 'src/lib', type: 'service' as const },
      { dir: 'lib', type: 'service' as const },
    ];

    for (const pattern of scanPatterns) {
      const fullPath = path.join(projectPath, pattern.dir);
      try {
        const files = await this.scanDirectory(fullPath, pattern.type);
        totalFiles += files.length;

        if (pattern.type === 'route') routes.push(...files);
        else if (pattern.type === 'component') components.push(...files);
        else if (pattern.type === 'service') services.push(...files);
      } catch {
        // Directory doesn't exist
      }
    }

    return {
      totalFiles,
      routes: routes.slice(0, 20),
      components: components.slice(0, 30),
      services: services.slice(0, 20),
      framework,
      language,
      dependencies,
    };
  }

  private async scanDirectory(
    dirPath: string,
    type: 'route' | 'component' | 'service' | 'model' | 'config' | 'test' | 'other'
  ): Promise<AnalysisFileInfo[]> {
    const results: AnalysisFileInfo[] = [];

    try {
      const entries = (await secureFs.readdir(dirPath, {
        withFileTypes: true,
      })) as import('fs').Dirent[];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subResults = await this.scanDirectory(path.join(dirPath, entry.name), type);
          results.push(...subResults);
        } else if (entry.isFile() && this.isCodeFile(entry.name)) {
          results.push({
            path: path.join(dirPath, entry.name),
            type,
            name: entry.name.replace(/\.(tsx?|jsx?|vue)$/, ''),
          });
        }
      }
    } catch {
      // Ignore errors
    }

    return results;
  }

  private isCodeFile(filename: string): boolean {
    return (
      /\.(tsx?|jsx?|vue|svelte)$/.test(filename) &&
      !filename.includes('.test.') &&
      !filename.includes('.spec.')
    );
  }

  private async generateAnalysisSuggestions(
    _projectPath: string,
    structure: Awaited<ReturnType<typeof this.gatherProjectStructure>>
  ): Promise<AnalysisSuggestion[]> {
    // Generate basic suggestions based on project structure analysis
    const suggestions: AnalysisSuggestion[] = [];

    if (structure.routes.length > 0 && structure.routes.length < 5) {
      suggestions.push({
        id: this.generateId('sug'),
        category: 'feature',
        title: 'Expand Core Functionality',
        description: 'The app has a small number of routes. Consider adding more features.',
        rationale: `Only ${structure.routes.length} routes detected. Most apps benefit from additional navigation options.`,
        priority: 'medium',
      });
    }

    if (
      !structure.dependencies?.includes('react-query') &&
      !structure.dependencies?.includes('@tanstack/react-query')
    ) {
      suggestions.push({
        id: this.generateId('sug'),
        category: 'technical',
        title: 'Add Data Fetching Library',
        description: 'Consider adding React Query or similar for better data management.',
        rationale:
          'Data fetching libraries provide caching, background updates, and better loading states.',
        priority: 'low',
      });
    }

    return suggestions;
  }

  private generateAnalysisSummary(
    structure: Awaited<ReturnType<typeof this.gatherProjectStructure>>,
    suggestions: AnalysisSuggestion[]
  ): string {
    const parts: string[] = [];

    if (structure.framework) {
      parts.push(`${structure.framework} ${structure.language || ''} application`);
    }

    parts.push(`with ${structure.totalFiles} code files`);
    parts.push(`${structure.routes.length} routes`);
    parts.push(`${structure.components.length} components`);
    parts.push(`${structure.services.length} services`);

    const summary = parts.join(', ');
    const highPriority = suggestions.filter((s) => s.priority === 'high').length;

    return `${summary}. Found ${suggestions.length} improvement opportunities${highPriority > 0 ? ` (${highPriority} high priority)` : ''}.`;
  }

  /**
   * Map idea/suggestion category to feature category.
   * Used by both idea-to-feature and suggestion-to-feature conversion.
   */
  mapSuggestionCategoryToFeatureCategory(category: IdeaCategory): string {
    return IDEATION_CATEGORY_TYPE_MAPPING[category] || 'feature';
  }

  private async saveSessionToDisk(
    projectPath: string,
    session: IdeationSession,
    messages: IdeationMessage[]
  ): Promise<void> {
    await secureFs.mkdir(getIdeationSessionsDir(projectPath), { recursive: true });
    const data = { session, messages };
    await secureFs.writeFile(
      getIdeationSessionPath(projectPath, session.id),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  }

  private async loadSessionFromDisk(
    projectPath: string,
    sessionId: string
  ): Promise<{ session: IdeationSession; messages: IdeationMessage[] } | null> {
    try {
      const content = (await secureFs.readFile(
        getIdeationSessionPath(projectPath, sessionId),
        'utf-8'
      )) as string;
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  // ============================================================================
  // Custom Prompts
  // ============================================================================

  async saveCustomPrompt(
    projectPath: string,
    input: {
      title: string;
      prompt: string;
      category?: IdeaCategory;
      isTemplate?: boolean;
      templateFields?: string[];
    }
  ): Promise<CustomIdeationPrompt> {
    validateWorkingDirectory(projectPath);
    await ensureIdeationDir(projectPath);

    const id = this.generateId('custom');
    const now = new Date().toISOString();

    const customPrompt: CustomIdeationPrompt = {
      id,
      title: input.title,
      prompt: input.prompt,
      category: input.category,
      isTemplate: input.isTemplate ?? false,
      templateFields: input.templateFields,
      createdAt: now,
      updatedAt: now,
    };

    const dir = getCustomPromptsDir(projectPath);
    await secureFs.mkdir(dir, { recursive: true });
    await secureFs.writeFile(
      getCustomPromptPath(projectPath, id),
      JSON.stringify(customPrompt, null, 2),
      'utf-8'
    );

    return customPrompt;
  }

  async listCustomPrompts(projectPath: string): Promise<CustomIdeationPrompt[]> {
    validateWorkingDirectory(projectPath);
    try {
      const dir = getCustomPromptsDir(projectPath);
      try {
        await secureFs.access(dir);
      } catch {
        return [];
      }

      const files = await secureFs.readdir(dir);
      const prompts: CustomIdeationPrompt[] = [];

      for (const file of files) {
        if (typeof file === 'string' && file.endsWith('.json')) {
          try {
            const content = (await secureFs.readFile(path.join(dir, file), 'utf-8')) as string;
            prompts.push(JSON.parse(content));
          } catch (error) {
            logger.warn(`Failed to load custom prompt ${file}:`, error);
          }
        }
      }

      return prompts.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      logger.error('Failed to list custom prompts:', error);
      return [];
    }
  }

  async getCustomPrompt(
    projectPath: string,
    promptId: string
  ): Promise<CustomIdeationPrompt | null> {
    validateWorkingDirectory(projectPath);
    if (promptId.includes('..') || promptId.includes('/') || promptId.includes('\\')) {
      throw new Error('Invalid prompt ID');
    }
    try {
      const content = (await secureFs.readFile(
        getCustomPromptPath(projectPath, promptId),
        'utf-8'
      )) as string;
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async updateCustomPrompt(
    projectPath: string,
    promptId: string,
    updates: Partial<
      Pick<CustomIdeationPrompt, 'title' | 'prompt' | 'category' | 'isTemplate' | 'templateFields'>
    >
  ): Promise<CustomIdeationPrompt | null> {
    validateWorkingDirectory(projectPath);
    if (promptId.includes('..') || promptId.includes('/') || promptId.includes('\\')) {
      throw new Error('Invalid prompt ID');
    }
    const existing = await this.getCustomPrompt(projectPath, promptId);
    if (!existing) return null;

    const updated: CustomIdeationPrompt = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await secureFs.writeFile(
      getCustomPromptPath(projectPath, promptId),
      JSON.stringify(updated, null, 2),
      'utf-8'
    );

    return updated;
  }

  async deleteCustomPrompt(projectPath: string, promptId: string): Promise<boolean> {
    validateWorkingDirectory(projectPath);
    if (promptId.includes('..') || promptId.includes('/') || promptId.includes('\\')) {
      throw new Error('Invalid prompt ID');
    }
    try {
      const promptPath = getCustomPromptPath(projectPath, promptId);
      await secureFs.unlink(promptPath);
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // Prompt History
  // ============================================================================

  async getPromptHistory(projectPath: string): Promise<CustomPromptHistoryEntry[]> {
    validateWorkingDirectory(projectPath);
    try {
      const historyPath = getPromptHistoryPath(projectPath);
      const content = (await secureFs.readFile(historyPath, 'utf-8')) as string;
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  async addToPromptHistory(
    projectPath: string,
    entry: Omit<CustomPromptHistoryEntry, 'id'>
  ): Promise<void> {
    validateWorkingDirectory(projectPath);
    await ensureIdeationDir(projectPath);
    const history = await this.getPromptHistory(projectPath);
    const newEntry: CustomPromptHistoryEntry = {
      ...entry,
      id: this.generateId('history'),
    };
    history.unshift(newEntry); // newest first
    // Keep last 100 entries
    const trimmed = history.slice(0, 100);
    await secureFs.writeFile(
      getPromptHistoryPath(projectPath),
      JSON.stringify(trimmed, null, 2),
      'utf-8'
    );
  }

  // ============================================================================
  // Enhance Prompt
  // ============================================================================

  async enhancePrompt(
    options: EnhancePromptOptions
  ): Promise<{ original: string; enhanced: string }> {
    const {
      projectPath,
      promptText,
      category,
      intensity = 'refine',
      contextSources,
      customSystemPrompt,
      model,
      thinkingLevel,
      enhancementMode,
    } = options;
    validateWorkingDirectory(projectPath);

    // Merge context sources with defaults
    const sources = { ...DEFAULT_IDEATION_CONTEXT_SOURCES, ...contextSources };

    // Load project context (same pattern as generateSuggestions)
    let projectContext = '';
    try {
      const contextResult = await loadContextFiles({
        projectPath,
        fsModule: secureFs as Parameters<typeof loadContextFiles>[0]['fsModule'],
        includeContextFiles: sources.useContextFiles,
        includeMemory: sources.useMemoryFiles,
      });
      projectContext = contextResult.formattedPrompt;

      if (sources.useAppSpec) {
        const appSpecContext = await this.buildAppSpecContext(projectPath);
        if (appSpecContext) {
          projectContext = projectContext
            ? `${projectContext}\n\n${appSpecContext}`
            : appSpecContext;
        }
      }
    } catch {
      // Continue without project context if loading fails
    }

    const categoryContext = category ? `\nThe ideas should be in the "${category}" category.` : '';

    const projectContextSection = projectContext
      ? `\n\n## Project Context\n${projectContext}\n\nUse this project context to make the enhanced prompt specific to this project's architecture, tech stack, and existing features. Don't just improve the wording — ground it in the actual project.`
      : '';

    const systemPrompt =
      customSystemPrompt ??
      buildEnhanceSystemPrompt(intensity, categoryContext, projectContextSection);

    // Get model - use override if provided, otherwise use phase model
    const phaseResult = await getPhaseModelWithOverrides(
      'ideationModel',
      this.settingsService,
      projectPath,
      '[IdeationService:enhancePrompt]'
    );
    const resolved = model
      ? {
          model: resolveModelString(model),
          thinkingLevel: thinkingLevel as ThinkingLevel | undefined,
          reasoningEffort: undefined,
        }
      : resolvePhaseModel(phaseResult.phaseModel);
    const modelId = resolved.model;
    const claudeCompatibleProvider = phaseResult.provider;
    const credentials = phaseResult.credentials;
    const claudeCodeExecutablePath = await getClaudeCodeExecutablePath(this.settingsService);
    const claudeCodeExtraArgs = await getClaudeCodeExtraArgs(this.settingsService);
    const claudeCodeEnvVars = await getClaudeCodeEnvVars(this.settingsService);

    const provider = ProviderFactory.getProviderForModel(modelId);
    const bareModel = stripProviderPrefix(modelId);

    // Apply enhancementMode system prompt if provided
    let finalSystemPrompt = systemPrompt;
    if (enhancementMode && isValidEnhancementMode(enhancementMode) && !customSystemPrompt) {
      const modePrompt = getEnhancementSystemPrompt(enhancementMode);
      finalSystemPrompt = `${systemPrompt}\n\n## Enhancement Mode Instructions\n${modePrompt}`;
    }

    const executeOptions: ExecuteOptions = {
      prompt: promptText,
      model: bareModel,
      originalModel: modelId,
      cwd: projectPath,
      systemPrompt: finalSystemPrompt,
      maxTurns: 1,
      allowedTools: [],
      abortController: new AbortController(),
      readOnly: true,
      thinkingLevel: resolved.thinkingLevel,
      claudeCompatibleProvider,
      credentials,
      claudeCodeExecutablePath,
      claudeCodeExtraArgs,
      claudeCodeEnvVars,
    };

    const stream = provider.executeQuery(executeOptions);
    let responseText = '';
    for await (const msg of stream) {
      if (msg.type === 'assistant' && msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.type === 'text') {
            responseText += block.text;
          }
        }
      } else if (msg.type === 'result' && msg.subtype === 'success' && msg.result) {
        responseText = msg.result;
      }
    }

    return { original: promptText, enhanced: responseText.trim() };
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
