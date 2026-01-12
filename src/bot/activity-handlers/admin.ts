import { ActivityHandler } from "@microsoft/agents-hosting";

export class AdminHandler extends ActivityHandler {
  constructor() {
    super();
    this.onMembersAdded(async (context, next) => {
      console.log("Members added:", context.activity.membersAdded, context.activity);
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded!) {
        if (member.id !== context.activity.recipient!.id) {
          await context.sendActivity("Welcome to the Admin bot!");
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
