import { TurnContext, UserState } from '@microsoft/agents-hosting';
import { Command } from '../core/commands/command';
import { CommandRequest } from '../interfaces';
import { USER_MODE_STATE_KEY } from '../config/constants';

export class GetModeCommand extends Command {
  constructor(private userState: UserState) {
    super('get-mode', 'Get the mode');
  }

  canExecute(_request: CommandRequest): boolean | Promise<boolean> {
    // TODO: add permission check
    return true;
  }

  async execute(request: CommandRequest, context: TurnContext) {
    const userModeAccessor = this.userState.createProperty<string>(USER_MODE_STATE_KEY);
    const mode = await userModeAccessor.get(context);
    await context.sendActivity(`Current mode is: ${mode ?? 'demo'}`);
  }
}
