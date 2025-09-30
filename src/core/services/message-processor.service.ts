import { ActivityHandler, CloudAdapter, TurnContext, type Request } from '@microsoft/agents-hosting';
import { type Response } from 'express';
import { AIHandler, DemoHandler, EchoHandler } from '../../activity-handlers';
import { createAdapter } from '../../adapter';
import { HelpCommand, ListModeCommand, MenuCommand, SetModeCommand } from '../../commands';
import { getMessageTextFromActivity } from '../../utils/helpers';
import { CommandExecutor, CommandParser } from '../commands';
import { ConfigurationService } from './configuration-service';
import { LoggerService } from './logger-service';

export class MessageProcessorService {
  private adapter: CloudAdapter;
  private commandParser: CommandParser;
  private commandExecutor: CommandExecutor;
  private handlers: Record<string, ActivityHandler>;

  constructor(
    private config: ConfigurationService,
    private logger: LoggerService
  ) {
    this.adapter = createAdapter();
    this.commandParser = new CommandParser(this.config.getCommandConfig());
    this.commandExecutor = new CommandExecutor(this.config.getCommandConfig());

    this.handlers = {
      echo: new EchoHandler(),
      demo: new DemoHandler(),
      ai: new AIHandler(config.getAzureOpenAIConfig(), this.logger),
    };

    this.commandExecutor.register(new ListModeCommand(Object.keys(this.handlers)));
    this.commandExecutor.register(new SetModeCommand());
    this.commandExecutor.register(new MenuCommand());
    this.commandExecutor.register(new HelpCommand(this.commandExecutor));
  }

  async process(req: Request, res: Response) {
    return this.adapter.process(req, res, this.logic.bind(this));
  }

  private async logic(context: TurnContext) {
    const message = getMessageTextFromActivity(context.activity);
    if (message && this.commandParser.isCommand(message)) {
      const commandRequest = this.commandParser.parse(message);
      if (commandRequest) {
        await this.commandExecutor.execute(commandRequest, context);
      } else {
        await context.sendActivity(`❓ Sorry, I couldn't parse that command.`);
      }
    } else {
      // TODO: use appropriate handler based on user selected mode
      // For now, default to demo handler
      const handler = this.handlers.demo;

      await handler.run(context);
    }
  }
}
