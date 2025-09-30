import { TurnContext } from '@microsoft/agents-hosting';
import { Command } from '../core/commands/command';
import { CommandRequest } from '../interfaces';

export class MenuCommand extends Command {
  constructor() {
    super('menu', 'Show the menu');
  }

  canExecute(request: CommandRequest): boolean | Promise<boolean> {
    return true;
  }

  async execute(_request: CommandRequest, context: TurnContext) {
    await context.sendActivity(`Menu: Pizza, Burger, Pasta`);
  }
}
