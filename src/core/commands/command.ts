import { TurnContext } from '@microsoft/agents-hosting';
import { CommandRequest } from '../../interfaces';

export abstract class Command {
  name: string;
  description: string;
  args: { name: string; required?: boolean }[];

  constructor(name: string, description: string, args: { name: string; required?: boolean }[] = []) {
    this.name = name;
    this.description = description;
    this.args = args;
  }

  /** permission and validations check */
  abstract canExecute(request: CommandRequest): boolean | Promise<boolean>;
  /** Command logic (must be implemented) */
  abstract execute(request: CommandRequest, context: TurnContext): Promise<void>;
}

export class CommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandError';
  }
}
