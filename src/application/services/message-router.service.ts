import { ActivityHandler, TurnContext } from "@microsoft/agents-hosting";
import { CommandExecutor, CommandParser } from "src/domain/commands";
import { IUserPreferencesRepository } from "src/domain/repositories";
import { IConfigurationService } from "src/shared/interfaces";
import { getMessageTextFromActivity } from "src/utils/helpers";

/**
 * Routes incoming messages to commands or activity handlers.
 * Manages handler registration and resolution based on user preferences.
 */
export class MessageRouterService {
  private handlers: Map<string, ActivityHandler> = new Map();
  private commandParser: CommandParser;

  constructor(
    private config: IConfigurationService,
    private commandExecutor: CommandExecutor,
    private userPreferences: IUserPreferencesRepository,
    private chatHandler: ActivityHandler
  ) {
    this.commandParser = new CommandParser(this.config.getCommandConfig());
  }

  /**
   * Register handlers.
   */
  registerHandlers(handlers: Record<string, ActivityHandler>): void {
    for (const [name, handler] of Object.entries(handlers)) {
      this.handlers.set(name, handler);
    }
  }

  /**
   * Get all registered handler names.
   */
  getHandlerNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Route and process an incoming message.
   */
  async route(context: TurnContext): Promise<void> {
    const message = getMessageTextFromActivity(context.activity);

    if (message && this.commandParser.isCommand(message)) {
      await this.handleCommand(context, message);
    } else {
      await this.handleActivity(context);
    }
  }

  private async handleCommand(context: TurnContext, message: string): Promise<void> {
    const commandRequest = this.commandParser.parse(message);
    if (commandRequest) {
      await this.commandExecutor.execute(commandRequest, context);
    } else {
      await context.sendActivity("Sorry, I couldn't parse that command.");
    }
  }

  private async handleActivity(context: TurnContext): Promise<void> {
    const handler = await this.resolveHandler(context);
    await handler.run(context);
  }

  /**
   * Resolve the appropriate handler for a given context.
   * Priority: User-set mode > Chat handler (default)
   */
  private async resolveHandler(context: TurnContext): Promise<ActivityHandler> {
    const userMode = await this.userPreferences.getMode(context);
    if (userMode && this.handlers.has(userMode)) {
      return this.handlers.get(userMode)!;
    }

    // Default to chat handler
    return this.chatHandler;
  }
}
