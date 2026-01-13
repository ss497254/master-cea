import { TurnContext } from "@microsoft/agents-hosting";
import { ILogger } from "src/shared/interfaces";
import { BaseActivityHandler } from "./base.handler";

export class EchoHandler extends BaseActivityHandler {
  constructor(logger: ILogger) {
    super("Echo", logger);
  }

  protected async processMessage(context: TurnContext): Promise<void> {
    await context.sendActivity(`You said: ${context.activity.text}`);
  }
}
