import { ICommandConfig, CommandRequest } from "../../interfaces";

export class CommandParser {
  constructor(private config: ICommandConfig) {}

  isCommand(message: string): boolean {
    return this.isValidMessage(message) && this.isValidCommandName(message);
  }

  parse(message: string): CommandRequest | null {
    // parse command and args
    const parts = message.slice(this.config.prefix.length).split(/\s+/);
    const command = parts[0];

    const args: string[] = [];
    const namedArgs: Record<string, string> = {};

    for (const part of parts.slice(1)) {
      if (part.startsWith("--")) {
        const [key, value] = part.slice(2).split("=", 2);
        namedArgs[key] = value ?? "true";
      } else {
        args.push(part);
      }
    }

    return { command, args, namedArgs, raw: message };
  }

  private isValidMessage(message: string): boolean {
    if (message.length === 0) {
      return false;
    } else if (!message.startsWith(this.config.prefix)) {
      return false;
    } else if (message.length > 1000) {
      return false;
    } else if (!/^[\x20-\x7E]*$/.test(message)) {
      return false; // non-ASCII characters
    } else if (message.includes("\n")) {
      return false; // newlines
    }
    return true;
  }

  private isValidCommandName(message: string): boolean {
    const parts = message.slice(this.config.prefix.length).split(/\s+/);
    const command = parts[0];
    if (!command) {
      return false;
    } else if (command.length > 50) {
      return false; // prevent abuse
    } else if (!/^[a-zA-Z0-9-_]+$/.test(command)) {
      return false; // invalid command name
    } else if (parts.length > 20) {
      return false; // too many parts
    }

    return true;
  }
}
