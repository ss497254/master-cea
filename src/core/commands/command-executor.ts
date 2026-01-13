import { TurnContext } from "@microsoft/agents-hosting";
import { CommandRequest, ICommandConfig } from "../../interfaces";
import { Command, CommandError } from "./command";

export class CommandExecutor {
  private commands: Map<string, Command> = new Map();

  constructor(private config: ICommandConfig) {}

  register(command: Command) {
    this.commands.set(command.name, command);
  }

  unregister(commandName: string) {
    this.commands.delete(commandName);
  }

  getCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  async execute(request: CommandRequest, context: TurnContext): Promise<void> {
    const cmd = this.commands.get(request.command);

    try {
      if (!cmd) {
        throw new CommandError(
          `❓ Unknown command: ${this.config.prefix}${request.command}. Type ${this.config.prefix}help to see available commands.`
        );
      }

      // Check for missing required arguments
      const missingArgs = cmd.args
        .filter((arg, idx) => arg.required && !(request.namedArgs[arg.name] ?? request.args[idx]))
        .map(arg => arg.name);

      if (missingArgs.length > 0) {
        throw new CommandError(`Missing required arguments: ${missingArgs.join(", ")}`);
      }

      // permission check
      if (!(await cmd.canExecute(request))) {
        throw new CommandError(`🚫 You don't have permission to run ${this.config.prefix}${cmd.name}`);
      }

      return await cmd.execute(request, context);
    } catch (err) {
      if (err instanceof CommandError) {
        await context.sendActivity(err.message);
        return;
      }
      await context.sendActivity(`⚠️ Error executing ${request.command}: ${(err as Error).message}`);
    }
  }

  help(): string {
    let output = "📖 Available commands:\n";
    for (const cmd of this.commands.values()) {
      const argsText =
        cmd.args && cmd.args.length > 0
          ? " " + cmd.args.map(a => (a.required ? `<${a.name}>` : `[${a.name}]`)).join(" ")
          : "";
      output += `- ${this.config.prefix}${cmd.name}${argsText} - ${cmd.description}\n`;
    }
    return output.trim();
  }
}
