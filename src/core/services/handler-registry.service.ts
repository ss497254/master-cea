import { ActivityHandler, TurnContext } from "@microsoft/agents-hosting";
import { ILogger } from "src/shared/interfaces";
import { IUserPreferencesRepository } from "src/core/repositories";
import { OrchestratorService } from "./orchestrator.service";

/**
 * Manages activity handler registration and resolution.
 * Handles user mode preferences and orchestrator-based routing.
 */
export class HandlerRegistryService {
  private handlers: Map<string, ActivityHandler> = new Map();
  private defaultHandler = "ai";

  constructor(
    private userPreferences: IUserPreferencesRepository,
    private orchestrator: OrchestratorService,
    private logger: ILogger
  ) {}

  /**
   * Register a handler with a given name.
   */
  register(name: string, handler: ActivityHandler): void {
    this.handlers.set(name, handler);
  }

  /**
   * Register multiple handlers at once.
   */
  registerAll(handlers: Record<string, ActivityHandler>): void {
    for (const [name, handler] of Object.entries(handlers)) {
      this.register(name, handler);
    }
  }

  /**
   * Get all registered handler names.
   */
  getHandlerNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if a handler exists.
   */
  hasHandler(name: string): boolean {
    return this.handlers.has(name);
  }

  /**
   * Resolve the appropriate handler for a given context and message.
   * Priority: User-set mode > Orchestrator routing > Default handler
   */
  async resolveHandler(context: TurnContext, message: string): Promise<ActivityHandler> {
    // Check if user has explicitly set a mode
    const userMode = await this.userPreferences.getMode(context);
    if (userMode && this.handlers.has(userMode)) {
      return this.handlers.get(userMode)!;
    }

    // Use orchestrator if enabled
    if (this.orchestrator.isEnabled() && message) {
      const decision = await this.orchestrator.route(message, context);
      this.logger.debug("Orchestrator routing", {
        handler: decision.handler,
        capability: decision.capability,
        cached: decision.cached,
      });

      if (this.handlers.has(decision.handler)) {
        return this.handlers.get(decision.handler)!;
      }
    }

    // Default handler
    return this.handlers.get(this.defaultHandler)!;
  }
}
