import { TurnContext } from "@microsoft/agents-hosting";
import { Command } from "src/core/commands/command";
import { CommandRequest } from "src/shared/interfaces";
import type { CommandExecutor } from "src/core/commands";

export class HelpCommand extends Command {
  constructor(private executor: CommandExecutor) {
    super("help", "Show the help menu");
  }

  canExecute(_request: CommandRequest): boolean | Promise<boolean> {
    return true;
  }

  async execute(_request: CommandRequest, context: TurnContext) {
    await context.sendActivity(this.executor.help());
  }
}
