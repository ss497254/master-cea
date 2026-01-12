import { BotInvokeRoute, BotMessageRoute } from 'src/interfaces/bot/route';
import { sendActivity, sendCard } from 'src/utils/helpers';
import { PLAYGROUND_CARD } from '../cards/playground';

export const PlaygroundRoute: BotMessageRoute = {
  keyword: 'playground',
  description: 'Sends the playground adaptive card',
  handler: async context => {
    await sendCard(context, PLAYGROUND_CARD);
  },
};

export const PlaygroundInvokeRoute: BotInvokeRoute = {
  name: 'invoke',
  handler: async context => {
    const payload = context.activity.value ?? (context.activity.value as any)?.data;

    await sendActivity(context, {
      type: 'invokeResponse',
      value: {
        status: 200,
        body: {},
      },
    });

    // This is a placeholder for handling the invoke from the playground card
    await context.sendActivity(
      'Playground invoke received. Processing payload...' + JSON.stringify(context.activity.value)
    );
  },
};
