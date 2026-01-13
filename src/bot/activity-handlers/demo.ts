/* eslint-disable no-unsafe-finally */
import { ActivityTypes } from "@microsoft/agents-activity";
import { ActivityHandler, AuthConfiguration, TurnContext } from "@microsoft/agents-hosting";
import { getActivityRoutes } from "src/bot/demo/routes";
import { BotInvokeRoute, BotMessageRoute, ILogger } from "src/shared/interfaces";
import { isInvokeActivityForRoute, isMessageActivityForRoute } from "src/utils/helpers";

export class DemoHandler extends ActivityHandler {
  protected readonly routes: {
    MessageRoutes: BotMessageRoute[];
    InvokeRoutes: BotInvokeRoute[];
  };

  constructor(
    private config: AuthConfiguration,
    private logger: ILogger
  ) {
    super();

    this.routes = getActivityRoutes();
  }

  protected async onTurnActivity(context: TurnContext) {
    switch (context.activity.type) {
      case ActivityTypes.Message:
        await this.handleMessage(context);
        break;
      case ActivityTypes.Invoke: {
        await this.handleInvoke(context);
        break;
      }
    }
  }

  private async handleMessage(context: TurnContext) {
    for (const route of this.routes.MessageRoutes) {
      if (isMessageActivityForRoute(context.activity, route.keyword)) {
        try {
          this.logger.info(`Handling message route: ${route.keyword}`);
          await route.handler(context);
        } catch (error) {
          this.logger.error("Error handling message route:", error as Error);
          await context.sendActivity("Sorry, something went wrong while processing your request.");
        } finally {
          if (context.responded) return;
        }
      }
    }

    // Not logging a message, as this is totally valid scenario
    await context.sendActivity("I'm not sure how to respond to that. Type 'help' for assistance.");
  }

  private async handleInvoke(context: TurnContext) {
    for (const route of this.routes.InvokeRoutes) {
      if (isInvokeActivityForRoute(context.activity, route.name)) {
        try {
          this.logger.info(`Handling invoke route: ${route.name}`);
          await route.handler(context);
        } catch (error) {
          this.logger.error("Error handling invoke route:", error as Error);
          await context.sendActivity("Sorry, something went wrong while processing your request.");
        } finally {
          if (context.responded) return;
        }
      }
    }

    this.logger.warn(`No handler found for invoke activity: ${context.activity.name}`);
    await context.sendActivity("I'm not sure how to respond to that invoke request.");
  }
}
