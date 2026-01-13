import { TurnContext } from "@microsoft/agents-hosting";
import { getMessageTextFromActivity } from "src/utils/helpers";
import { CommandExecutor, CommandParser } from "src/core/commands";
import { HandlerRegistryService } from "./handler-registry.service";

/**
 * Routes incoming messages to either command execution or activity handlers.
 */
export class MessageRouterService {
  constructor(
    private commandParser: CommandParser,
    private commandExecutor: CommandExecutor,
    private handlerRegistry: HandlerRegistryService
  ) {}

  /**
   * Route and process an incoming message.
   */
  async route(context: TurnContext): Promise<void> {
    const message = getMessageTextFromActivity(context.activity);

    if (message && this.commandParser.isCommand(message)) {
      await this.handleCommand(context, message);
    } else {
      await this.handleActivity(context, message || "");
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

  private async handleActivity(context: TurnContext, message: string): Promise<void> {
    const handler = await this.handlerRegistry.resolveHandler(context, message);
    await handler.run(context);
  }
}
