import { TurnContext } from "@microsoft/agents-hosting";
import { ILogger } from "src/shared/interfaces";
import { BaseActivityHandler } from "./base.handler";

export class EchoActivityHandler extends BaseActivityHandler {
  constructor(logger: ILogger) {
    super("Echo Activity", logger);
    this.setupInvokeHandler();
  }

  protected async processMessage(context: TurnContext): Promise<void> {
    await context.sendActivity(`\
\`\`\`json
${JSON.stringify(context.activity, null, 2)}
\`\`\``);
  }

  private setupInvokeHandler(): void {
    this.onInvokeActivity = async context => {
      await context.sendActivity(`\
\`\`\`json
${JSON.stringify(context.activity, null, 2)}
\`\`\``);
      return { status: 200 };
    };
  }
}
