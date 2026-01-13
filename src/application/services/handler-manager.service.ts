import { ActivityHandler, TurnContext } from "@microsoft/agents-hosting";
import { IUserPreferencesRepository } from "src/domain/repositories";

/**
 * Manages activity handler registration and resolution.
 * Handles user mode preferences and orchestrator-based routing.
 */
export class HandlerRegistryService {
  private handlers: Map<string, ActivityHandler> = new Map();

  constructor(
    private userPreferences: IUserPreferencesRepository,
    private defaultHandler: ActivityHandler
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
  async resolveHandler(context: TurnContext): Promise<ActivityHandler> {
    // Check if user has explicitly set a mode
    const userMode = await this.userPreferences.getMode(context);
    if (userMode && this.handlers.has(userMode)) {
      return this.handlers.get(userMode)!;
    }

    // Default handler
    return this.defaultHandler;
  }
}
