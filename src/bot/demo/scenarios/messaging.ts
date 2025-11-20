import { BotMessageRoute } from 'src/interfaces/bot/route';

export const NoResponseRoute: BotMessageRoute = {
  keyword: 'noresponse',
  description: 'Simulates a route that does not send any response',
  handler: async _context => {
    // Intentionally do nothing to simulate no response
  },
};

export const DelayRoute: BotMessageRoute = {
  keyword: /^delay\s+(\d+)$/i,
  description: 'Simulates a route that delays response by a specified number of seconds',
  example: 'delay 5',
  handler: async context => {
    const match = context.activity.text!.match(/^delay\s+(\d+)$/i);
    const seconds = match ? parseInt(match[1]) : NaN;

    if (isNaN(seconds)) {
      await context.sendActivity('Please provide a valid number of seconds');
      return;
    }

    await new Promise(res => setTimeout(res, seconds * 1000));
    await context.sendActivity(`This response was delayed by ${seconds} seconds`);
  },
};

export const AsyncMessageRoute: BotMessageRoute = {
  keyword: /^async-message-(\d+)$/i,
  description: 'Sends a message after a delay. Usage: async-message-{seconds}',
  example: 'async-message-5',
  handler: async context => {
    const match = context.activity.text!.match(/^async-message-(\d+)$/i);
    const time = match ? parseInt(match[1]) : NaN;

    if (isNaN(time)) {
      await context.sendActivity('Please provide a valid time in format: async-message-{seconds}');
      return;
    }

    await context.sendActivity(`Message received, processing async delay of ${time} seconds`);
    await new Promise(res => setTimeout(res, time * 1000));
    await context.sendActivity(`This is an async message after ${time} sec`);
  },
};
