import { ActivityTypes } from '@microsoft/agents-activity';
import {
  ActivityHandler,
  AuthConfiguration,
  RouteList,
  RouteRank,
  RouteSelector,
  TurnContext,
  TurnState,
} from '@microsoft/agents-hosting';
import { LoggerService } from '../core/services';

export class DemoHandler extends ActivityHandler {
  protected readonly _routes: RouteList<TurnState> = new RouteList<TurnState>();

  constructor(
    private config: AuthConfiguration,
    private logger: LoggerService
  ) {
    super();
    this.onMessage(async (context, next) => {
      await this.handleMessage(context);
      await next();
    });

    this.message('help', async (context: TurnContext) => {
      await context.sendActivity('This is the demo bot. You can say "hello" to get started.');
    });

    this.message('hello', async (context: TurnContext) => {
      await context.sendActivity(`You said: ${context.activity.text}`);
    });

    this.message('', async (context: TurnContext) => {
      await context.sendActivity("I'm not sure how to respond to that. Type 'help' for assistance.");
    });
  }

  private async handleMessage(context: TurnContext) {
    const state = new TurnState();

    for (const route of this._routes) {
      if (await route.selector(context)) {
        await route.handler(context, state);
      }
    }
  }

  private message(
    keyword: string | RegExp | RouteSelector | (string | RegExp | RouteSelector)[],
    handler: (context: TurnContext, state: TurnState) => Promise<void>,
    isInvokeRoute: boolean = false,
    authHandlers: string[] = [],
    rank: RouteRank = RouteRank.Unspecified
  ) {
    (Array.isArray(keyword) ? keyword : [keyword]).forEach(k => {
      const selector = this.createMessageSelector(k);
      this._routes.addRoute(selector, handler, isInvokeRoute, rank, authHandlers);
    });
  }

  private createMessageSelector(keyword: string | RegExp | RouteSelector): RouteSelector {
    if (typeof keyword === 'function') {
      return keyword;
    } else if (keyword instanceof RegExp) {
      return (context: TurnContext) => {
        if (context?.activity?.type === ActivityTypes.Message && context.activity.text) {
          return Promise.resolve(keyword.test(context.activity.text));
        } else {
          return Promise.resolve(false);
        }
      };
    } else {
      const k = keyword.toString().toLocaleLowerCase();
      return (context: TurnContext) => {
        if (context?.activity?.type === ActivityTypes.Message && context.activity.text) {
          return Promise.resolve(context.activity.text.toLocaleLowerCase() === k);
        } else {
          return Promise.resolve(false);
        }
      };
    }
  }
}
