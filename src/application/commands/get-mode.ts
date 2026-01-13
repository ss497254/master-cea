import { TurnContext } from "@microsoft/agents-hosting";
import { Command } from "src/domain/commands/command";
import { IUserPreferencesRepository } from "src/domain/repositories";
import { CommandRequest } from "src/shared/interfaces";

export class GetModeCommand extends Command {
  constructor(private userPreferences: IUserPreferencesRepository) {
    super("get-mode", "Get the mode");
  }

  canExecute(_request: CommandRequest): boolean | Promise<boolean> {
    return true;
  }

  async execute(_request: CommandRequest, context: TurnContext) {
    const mode = await this.userPreferences.getMode(context);
    await context.sendActivity(`Current mode is: ${mode ?? "demo"}`);
  }
}
