import {
  ActivityHandler,
  AuthConfiguration,
  RouteList,
  RouteRank,
  RouteSelector,
  TurnContext,
  TurnState,
} from '@microsoft/agents-hosting';
import { registerMessageRoutes } from 'src/bot/demo/register';
import { ILogger } from 'src/interfaces/services/logger';
import { getMessageTextFromActivity } from 'src/utils/helpers';

export class DemoHandler extends ActivityHandler {
  protected readonly _routes: RouteList<TurnState> = new RouteList<TurnState>();

  constructor(
    private config: AuthConfiguration,
    private logger: ILogger
  ) {
    super();
    this.onMessage(async (context, next) => {
      const state = new TurnState();

      for (const route of this._routes) {
        if (await route.selector(context)) {
          await route.handler(context, state);
        }
      }
      await next();
    });

    registerMessageRoutes(this, this.logger);
  }

  public message(
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
        const message = getMessageTextFromActivity(context.activity);
        if (message) {
          return Promise.resolve(keyword.test(message));
        } else {
          return Promise.resolve(false);
        }
      };
    } else {
      const k = keyword.toString().toLocaleLowerCase();
      return (context: TurnContext) => {
        const message = getMessageTextFromActivity(context.activity);
        if (message) {
          return Promise.resolve(k.length ? message.toLocaleLowerCase() === k : true);
        } else {
          return Promise.resolve(false);
        }
      };
    }
  }
}
