import { TurnContext } from "@microsoft/agents-hosting";
import { Command } from "src/core/commands/command";
import { CommandRequest } from "src/shared/interfaces";

export class MenuCommand extends Command {
  constructor() {
    super("menu", "Show the menu");
  }

  canExecute(_request: CommandRequest): boolean | Promise<boolean> {
    return true;
  }

  async execute(_request: CommandRequest, context: TurnContext) {
    await context.sendActivity(`Menu: Pizza, Burger, Pasta`);
  }
}
