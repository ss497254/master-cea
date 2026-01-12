import { ActivityHandler } from "@microsoft/agents-hosting";

export class EchoHandler extends ActivityHandler {
  constructor() {
    super();
    this.onMembersAdded(async (context, next) => {
      console.log("Members added:", context.activity.membersAdded, context.activity);
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
