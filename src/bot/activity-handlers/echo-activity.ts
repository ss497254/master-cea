import { ActivityHandler } from '@microsoft/agents-hosting';
import { sendCard } from 'src/utils/helpers';

export class EchoActivityHandler extends ActivityHandler {
  constructor() {
    super();
    this.onMembersAdded(async (context, next) => {
      console.log('Members added:', context.activity.membersAdded, context.activity);
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded!) {
        if (member.id !== context.activity.recipient!.id) {
          await context.sendActivity('Welcome to the Echo Activity bot!');
        }
      }
      await next();
    });

    this.onMessage(async (context, next) => {
      await sendCard(context, {
        type: 'AdaptiveCard',
        $schema: 'https://adaptivecards.io/schemas/adaptive-card.json',
        version: '1.5',
        body: [
          {
            type: 'TextBlock',
            text: `Activity Received: type=${context.activity.type}, from=${context.activity.from?.name ?? 'unknown'}`,
            size: 'Medium',
          },
          {
            type: 'CodeBlock',
            codeSnippet: JSON.stringify(context.activity, null, 2),
          },
        ],
      });
      await next();
    });

    this.onInvokeActivity = async context => {
      console.log('Invoke activity received:', context.activity);
      // Handle the invoke activity here
      await context.sendActivity(`Invoke activity received with name: ${context.activity.name}`);
      return { status: 200 };
    };
  }
}
