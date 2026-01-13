import { TurnContext } from "@microsoft/agents-hosting";
import { Command } from "src/core/commands/command";
import { CommandRequest } from "src/shared/interfaces";

export class ListModeCommand extends Command {
  constructor(private modes: string[] = []) {
    super("list-mode", "List available modes");
  }

  canExecute(_request: CommandRequest): boolean | Promise<boolean> {
    return true;
  }

  async execute(_request: CommandRequest, context: TurnContext) {
    await context.sendActivity(`Mode: ${this.modes.join(", ")}`);
  }
}
