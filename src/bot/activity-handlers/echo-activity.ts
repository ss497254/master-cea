import { ActivityHandler } from "@microsoft/agents-hosting";
import { ILogger } from "src/interfaces/services/logger";

export class EchoActivityHandler extends ActivityHandler {
  constructor(private logger: ILogger) {
    super();
    this.onMembersAdded(async (context, next) => {
      this.logger.debug("Members added", { members: context.activity.membersAdded });
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded!) {
        if (member.id !== context.activity.recipient!.id) {
          await context.sendActivity("Welcome to the Echo Activity bot!");
        }
      }
      await next();
    });

    this.onMessage(async (context, next) => {
      await context.sendActivity(`\
\`\`\`json
${JSON.stringify(context.activity, null, 2)}
\`\`\``);
      await next();
    });

    this.onInvokeActivity = async context => {
      await context.sendActivity(`\
\`\`\`json
${JSON.stringify(context.activity, null, 2)}
\`\`\``);
      return { status: 200 };
    };
  }
}
