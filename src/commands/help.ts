import { TurnContext } from '@microsoft/agents-hosting';
import { Command } from '../core/commands/command';
import { CommandRequest } from '../interfaces';
import type { CommandExecutor } from '../core/commands';

export class HelpCommand extends Command {
  constructor(private executor: CommandExecutor) {
    super('help', 'Show the help menu');
  }

  canExecute(_request: CommandRequest): boolean | Promise<boolean> {
    return true;
  }

  async execute(_request: CommandRequest, context: TurnContext) {
    await context.sendActivity(this.executor.help());
  }
}
