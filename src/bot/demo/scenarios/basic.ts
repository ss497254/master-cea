import { BotMessageRoute } from 'src/interfaces/bot/route';
import { sendActivity, sendCard } from 'src/utils/helpers';
import { messageBackCard } from '../cards/messageBack';

export const HelloWorldRoutes: BotMessageRoute = {
  keyword: 'hello',
  description: 'Responds with a greeting message',
  handler: async context => {
    await context.sendActivity('Hello! How can I assist you today?');
  },
};

export const AsyncMessageRoute: BotMessageRoute = {
  keyword: /async-message|asyncmessage|asyncMessage/i,
  description: 'Sends a message after a delay. Usage: async-message-{seconds}',
  handler: async context => {
    const time = parseInt(context.activity.text!.split('-')[1]);
    if (isNaN(time)) {
      await context.sendActivity('Please provide a valid time');
      return;
    } else {
      await context.sendActivity('message-received, async-' + time);

      await new Promise(res => setTimeout(res, time * 1000));
      await context.sendActivity(`This is an async message after ${time} sec`);
    }
  },
};

export const TextRoute: BotMessageRoute = {
  keyword: 'text',
  description: 'Sends a simple text message',
  handler: async context => {
    await context.sendActivity('This is only with full stop. See if its working');
  },
};

export const MediaRoute: BotMessageRoute = {
  keyword: 'media',
  description: 'Sends a media message with an image attachment',
  handler: async context => {
    const reply = {
      text: 'This is a media message',
      attachments: [
        {
          contentType: 'image/jpg',
          contentUrl: 'https://www.publicdomainpictures.net/pictures/30000/t2/duck-on-a-rock.jpg',
          name: 'duck-on-a-rock.jpg',
        },
      ],
    };
    await sendActivity(context, reply);
  },
};

export const MessageBackRoute: BotMessageRoute = {
  keyword: 'messageback',
  description: 'Sends a adaptive card with a MessageBack buttons',
  handler: async context => {
    await sendCard(context, messageBackCard);
  },
};

export const NoResponseRoute: BotMessageRoute = {
  keyword: 'noresponse',
  description: 'Simulates a route that does not send any response',
  handler: async context => {
    // Intentionally do nothing to simulate no response
  },
};

export const ErrorRoute: BotMessageRoute = {
  keyword: 'error',
  description: 'Simulates a route that throws an error',
  handler: async context => {
    throw new Error('This is a test error');
  },
};
