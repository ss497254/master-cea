import { ICommandConfig, CommandRequest } from '../../interfaces';

export class CommandParser {
  constructor(private config: ICommandConfig) {}

  isCommand(message: string): boolean {
    return message.trim().startsWith(this.config.prefix);
  }

  parse(message: string): CommandRequest | null {
    const trimmed = message.trim();
    if (!trimmed.startsWith(this.config.prefix)) return null;
    if (!this.isValidMessage(message)) return null;

    // parse command and args

    const parts = trimmed.slice(this.config.prefix.length).split(/\s+/);
    const command = parts[0];
    if (!command) {
      return null;
    } else if (command.length > 50) {
      return null; // prevent abuse
    } else if (!/^[a-zA-Z0-9-_]+$/.test(command)) {
      return null; // invalid command name
    } else if (parts.length > 20) {
      return null; // too many parts
    }

    const args: string[] = [];
    const namedArgs: Record<string, string> = {};

    for (const part of parts.slice(1)) {
      if (part.startsWith('--')) {
        const [key, value] = part.slice(2).split('=', 2);
        namedArgs[key] = value ?? 'true';
      } else {
        args.push(part);
      }
    }

    return { command, args, namedArgs, raw: message };
  }

  private isValidMessage(message: string): boolean {
    if (message.length > 1000) return false;
    if (!/^[\x20-\x7E]*$/.test(message)) return false;
    if (/\s{2,}/.test(message)) return false;
    if (message.includes('\n')) return false;
    if (message.includes('\t')) return false;
    if (message.includes('\r')) return false;
    if (message.includes('\f')) return false;
    if (message.includes('\v')) return false;
    if (message.includes('\0')) return false;
    if (message.includes('\b')) return false;
    if (message.includes('\u2028')) return false;
    if (message.includes('\u2029')) return false;
    return true;
  }
}
