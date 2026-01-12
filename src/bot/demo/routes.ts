import { BotInvokeRoute, BotMessageRoute } from 'src/interfaces/bot/route';
import { sendCard } from '../../utils/helpers';
import { getHelpCard } from './cards/help';
import * as Routes from './scenarios';

export function getActivityRoutes() {
  const MessageRoutes: BotMessageRoute[] = [];
  const InvokeRoutes: BotInvokeRoute[] = [];

  for (const route of Object.values(Routes)) {
    if ((route as BotMessageRoute).keyword !== undefined) {
      MessageRoutes.push(route as BotMessageRoute);
    } else if ((route as BotInvokeRoute).name !== undefined) {
      InvokeRoutes.push(route as BotInvokeRoute);
    }
  }

  // Help route, lists all available actions
  MessageRoutes.push({
    keyword: 'help',
    description: 'Provides help information about available actions',
    handler: async context => {
      const helpCard = getHelpCard(
        MessageRoutes.map(r => ({ title: r.description, value: r.example ?? r.keyword.toString() }))
      );
      await sendCard(context, helpCard);
    },
  });

  return { MessageRoutes, InvokeRoutes };
}
