import { TurnContext } from "@microsoft/agents-hosting";
import { ILogger } from "src/shared/interfaces";
import { BaseActivityHandler } from "./base.handler";

export class AdminHandler extends BaseActivityHandler {
  constructor(logger: ILogger) {
    super("Admin", logger);
  }

  protected async processMessage(context: TurnContext): Promise<void> {
    // TODO: Implement admin-specific message processing logic here
    await context.sendActivity(`You said: ${context.activity.text}`);
  }
}
