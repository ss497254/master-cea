import { Activity, ActivityTypes } from '@microsoft/agents-activity';
import { ActivityHandler, TurnContext } from '@microsoft/agents-hosting';

export class DemoHandler extends ActivityHandler {
  constructor() {
    super();
    this.onMessage(async (context, next) => {
      await this.handleMessage(context);
      await next();
    });
  }

  private async handleMessage(context: TurnContext) {
    const message = context.activity.text?.toLowerCase();

    if (message?.includes('hello')) {
      await context.sendActivity(`You said: ${context.activity.text}`);
    } else if (message?.includes('help')) {
      await context.sendActivity('How can I assist you?');
    } else {
      await context.sendActivity("I'm not sure how to respond to that.");
    }
  }
}
