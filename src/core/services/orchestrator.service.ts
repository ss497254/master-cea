import { createAzure, AzureOpenAIProvider } from "@ai-sdk/azure";
import { generateText } from "ai";
import { TurnContext, UserState } from "@microsoft/agents-hosting";
import { ORCHESTRATOR_ROUTING_PROMPT } from "src/config/prompts";
import {
  IAzureOpenAIConfig,
  IOrchestratorConfig,
  IRoutingDecision,
  ICachedDecision,
  HandlerType,
  ILogger,
} from "src/shared/interfaces";

const ORCHESTRATOR_CACHE_KEY = "orchestratorCache";

export class OrchestratorService {
  private azure: AzureOpenAIProvider;
  private userState: UserState;

  constructor(
    azureConfig: IAzureOpenAIConfig,
    private orchestratorConfig: IOrchestratorConfig,
    userState: UserState,
    private logger: ILogger
  ) {
    this.userState = userState;
    this.azure = createAzure({
      apiKey: azureConfig.apiKey,
      apiVersion: azureConfig.apiVersion,
      baseURL: azureConfig.endpoint,
    });
  }

  public isEnabled(): boolean {
    return this.orchestratorConfig.enabled;
  }

  public async route(message: string, context: TurnContext): Promise<IRoutingDecision> {
    if (!this.orchestratorConfig.enabled) {
      return this.getDefaultDecision();
    }

    // Check cache first
    const cached = await this.getCachedDecision(context);
    if (cached) {
      this.logger.debug("Using cached routing decision", {
        handler: cached.handler,
      });
      return {
        handler: cached.handler,
        capability: cached.capability,
        confidence: 1.0,
        cached: true,
      };
    }

    // Call AI for routing decision
    try {
      const decision = await this.classifyMessage(message);
      await this.cacheDecision(context, decision);
      return decision;
    } catch (error) {
      this.logger.error("Orchestrator routing failed, using default", error as Error);
      return this.getDefaultDecision();
    }
  }

  public async clearCache(context: TurnContext): Promise<void> {
    const cacheAccessor = this.userState.createProperty<ICachedDecision | null>(ORCHESTRATOR_CACHE_KEY);
    await cacheAccessor.set(context, null);
    await this.userState.saveChanges(context, false);
    this.logger.debug("Orchestrator cache cleared");
  }

  private async classifyMessage(message: string): Promise<IRoutingDecision> {
    const { text } = await generateText({
      model: this.azure(this.orchestratorConfig.deploymentName),
      system: ORCHESTRATOR_ROUTING_PROMPT,
      prompt: message,
      temperature: 0.1,
    });

    try {
      const parsed = JSON.parse(text.trim());
      const handler = this.validateHandler(parsed.handler);

      this.logger.debug("Orchestrator decision", {
        message: message.substring(0, 50),
        handler,
        capability: parsed.capability,
        confidence: parsed.confidence,
      });

      return {
        handler,
        capability: parsed.capability || undefined,
        confidence: parsed.confidence || 0.8,
        cached: false,
      };
    } catch (error) {
      this.logger.warn("Failed to parse orchestrator response", {
        response: text,
        error: (error as Error).message,
      });
      return this.getDefaultDecision();
    }
  }

  private validateHandler(handler: string): HandlerType {
    const validHandlers: HandlerType[] = ["demo", "ai", "admin", "echo"];
    if (validHandlers.includes(handler as HandlerType)) {
      return handler as HandlerType;
    }
    return "ai";
  }

  private async getCachedDecision(context: TurnContext): Promise<ICachedDecision | null> {
    const cacheAccessor = this.userState.createProperty<ICachedDecision | null>(ORCHESTRATOR_CACHE_KEY);
    const cached = await cacheAccessor.get(context);

    if (!cached) return null;

    // Check if cache is expired
    const now = Date.now();
    const cacheAge = (now - cached.timestamp) / 1000;
    if (cacheAge > this.orchestratorConfig.cacheTTL) {
      this.logger.debug("Orchestrator cache expired", {
        age: cacheAge,
        ttl: this.orchestratorConfig.cacheTTL,
      });
      return null;
    }

    return cached;
  }

  private async cacheDecision(context: TurnContext, decision: IRoutingDecision): Promise<void> {
    const cacheAccessor = this.userState.createProperty<ICachedDecision>(ORCHESTRATOR_CACHE_KEY);
    const cached: ICachedDecision = {
      handler: decision.handler,
      capability: decision.capability,
      timestamp: Date.now(),
    };
    await cacheAccessor.set(context, cached);
    await this.userState.saveChanges(context, false);
    this.logger.debug("Cached routing decision", { handler: decision.handler });
  }

  private getDefaultDecision(): IRoutingDecision {
    return {
      handler: "ai",
      capability: "general-qa",
      confidence: 0.5,
      cached: false,
    };
  }
}
