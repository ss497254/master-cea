import { TurnContext } from '@microsoft/agents-hosting';

export type BotMessageRoute = {
  keyword: string | RegExp;
  handler: (context: TurnContext) => Promise<void>;
  description?: string;
};
