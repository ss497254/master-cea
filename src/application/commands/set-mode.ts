import { TurnContext } from "@microsoft/agents-hosting";
import { Command } from "src/domain/commands/command";
import { IUserPreferencesRepository } from "src/domain/repositories";
import { CommandRequest } from "src/shared/interfaces";

export class SetModeCommand extends Command {
  constructor(private userPreferences: IUserPreferencesRepository) {
    super("set-mode", "Set the mode", [
      {
        name: "mode",
        required: true,
      },
    ]);
  }

  canExecute(_request: CommandRequest): boolean | Promise<boolean> {
    return true;
  }

  async execute(request: CommandRequest, context: TurnContext) {
    await this.userPreferences.setMode(context, request.args[0]);
    await context.sendActivity(`Setting mode to: ${request.args[0]}`);
  }
}
