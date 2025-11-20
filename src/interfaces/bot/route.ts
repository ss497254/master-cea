import { TurnContext } from '@microsoft/agents-hosting';

export type BotMessageRoute = {
  keyword: string | RegExp;
  description: string;
  example?: string;
  handler: (context: TurnContext) => Promise<void>;
};

export type BotInvokeRoute = {
  name: string;
  handler: (context: TurnContext) => Promise<void>;
};
