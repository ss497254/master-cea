import { TurnContext, UserState } from '@microsoft/agents-hosting';
import { USER_MODE_STATE_KEY } from '../config/constants';
import { Command } from '../core/commands/command';
import { CommandRequest } from '../interfaces';

export class SetModeCommand extends Command {
  constructor(private userState: UserState) {
    super('set-mode', 'Set the mode', [
      {
        name: 'mode',
        required: true,
      },
    ]);
  }

  canExecute(_request: CommandRequest): boolean | Promise<boolean> {
    // TODO: add permission check
    return true;
  }

  async execute(request: CommandRequest, context: TurnContext) {
    const userModeAccessor = this.userState.createProperty<string>(USER_MODE_STATE_KEY);
    await userModeAccessor.set(context, request.args[0]);
    await this.userState.saveChanges(context, false);
    await context.sendActivity(`Setting mode to: ${request.args[0]}`);
  }
}
