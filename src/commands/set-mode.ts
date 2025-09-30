import { TurnContext } from '@microsoft/agents-hosting';
import { Command } from '../core/commands/command';
import { CommandRequest } from '../interfaces';

export class SetModeCommand extends Command {
  constructor() {
    super('set-mode', 'Set the mode', [
      {
        name: 'mode',
        required: true,
      },
    ]);
  }

  canExecute(request: CommandRequest): boolean | Promise<boolean> {
    // TODO: add permission check
    return true;
  }

  async execute(request: CommandRequest, context: TurnContext) {
    await context.sendActivity(`Setting mode to: ${request.args[0]}`);
  }
}
