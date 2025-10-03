import { TurnContext } from '@microsoft/agents-hosting';
import { BotMessageRoute } from 'src/interfaces/bot/route';
import { ILogger } from '../../interfaces/services/logger';
import { sendCard } from '../../utils/helpers';
import type { DemoHandler } from '../activity-handlers/demo';
import { getHelpCard } from './cards/help';
import * as BasicRoutes from './scenarios/basic';
import { SensitivityRoute } from './scenarios/sensitivity';

const ROUTES: BotMessageRoute[] = [
  BasicRoutes.AsyncMessageRoute,
  BasicRoutes.ErrorRoute,
  BasicRoutes.HelloWorldRoutes,
  BasicRoutes.MediaRoute,
  BasicRoutes.NoResponseRoute,
  BasicRoutes.TextRoute,
  SensitivityRoute,
];

export function registerMessageRoutes(handler: DemoHandler, logger: ILogger) {
  for (const route of ROUTES) {
    handler.message(route.keyword, async (context: TurnContext) => {
      try {
        await route.handler(context);
      } catch (error) {
        logger.error('Error handling message route:', error as Error);
        await context.sendActivity('Sorry, something went wrong while processing your request.');
      }
    });
  }

  handler.message('help', async (context: TurnContext) => {
    await sendCard(
      context,
      getHelpCard(ROUTES.map(r => (typeof r.keyword === 'string' ? r.keyword : r.keyword.toString())))
    );
  });

  // Default handler for unmatched messages
  handler.message('', async (context: TurnContext) => {
    await context.sendActivity("I'm not sure how to respond to that. Type 'help' for assistance.");
  });
}
