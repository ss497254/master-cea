import { ActivityHandler } from "@microsoft/agents-hosting";

export class EchoActivityHandler extends ActivityHandler {
  constructor() {
    super();
    this.onMembersAdded(async (context, next) => {
      console.log("Members added:", context.activity.membersAdded, context.activity);
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
