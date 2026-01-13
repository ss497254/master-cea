/**
 * Bot-related interfaces
 */
import { TurnContext } from "@microsoft/agents-hosting";

export interface CommandRequest {
  command: string;
  args: string[]; // positional args
  namedArgs: Record<string, string>; // named args (--key=value)
  raw: string; // original message
}

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
