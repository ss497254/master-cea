import { ActivityHandler } from "@microsoft/agents-hosting";
import { ILogger } from "src/interfaces/services/logger";

export class EchoHandler extends ActivityHandler {
  constructor(private logger: ILogger) {
    super();
    this.onMembersAdded(async (context, next) => {
      this.logger.debug("Members added", { members: context.activity.membersAdded });
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded!) {
        if (member.id !== context.activity.recipient!.id) {
          await context.sendActivity("Welcome to the Echo bot!");
        }
      }
      await next();
    });

    this.onMessage(async (context, next) => {
      await context.sendActivity(`You said: ${context.activity.text}`);
      await next();
    });
  }
}
