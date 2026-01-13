import { TurnContext } from "@microsoft/agents-hosting";
import { CommandExecutor, CommandParser } from "src/domain/commands";
import { ConfigurationService } from "src/infrastructure/config/configuration.service";
import { getMessageTextFromActivity } from "src/utils/helpers";
import { HandlerRegistryService } from "./handler-manager.service";

/**
 * Routes incoming messages to either command execution or activity handlers.
 */
export class MessageRouterService {
  private commandParser: CommandParser;
  constructor(
    private config: ConfigurationService,
    private commandExecutor: CommandExecutor,
    private handlerRegistry: HandlerRegistryService
  ) {
    this.commandParser = new CommandParser(this.config.getCommandConfig());
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
    const handler = await this.handlerRegistry.resolveHandler(context);
    await handler.run(context);
  }
}
