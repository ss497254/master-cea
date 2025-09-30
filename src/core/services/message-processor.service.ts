import {
  ActivityHandler,
  CloudAdapter,
  ConversationState,
  MemoryStorage,
  Storage,
  TurnContext,
  UserState,
  type Request,
} from '@microsoft/agents-hosting';
import { type Response } from 'express';
import { AIHandler, DemoHandler, EchoHandler } from '../../activity-handlers';
import { createAdapter } from '../../adapter';
import { HelpCommand, ListModeCommand, MenuCommand, SetModeCommand } from '../../commands';
import { getMessageTextFromActivity } from '../../utils/helpers';
import { CommandExecutor, CommandParser } from '../commands';
import { ConfigurationService } from './configuration-service';
import { LoggerService } from './logger-service';
import { GetModeCommand } from '../../commands/get-mode';
import { USER_MODE_STATE_KEY } from '../../config/constants';

export class MessageProcessorService {
  private adapter: CloudAdapter;
  private commandParser: CommandParser;
  private commandExecutor: CommandExecutor;
  private handlers: Record<string, ActivityHandler>;
  private storage: Storage;
  private conversationState: ConversationState;
  private userState: UserState;

  constructor(
    private config: ConfigurationService,
    private logger: LoggerService
  ) {
    this.adapter = createAdapter();
    this.commandParser = new CommandParser(this.config.getCommandConfig());
    this.commandExecutor = new CommandExecutor(this.config.getCommandConfig());
    this.storage = new MemoryStorage();
    this.conversationState = new ConversationState(this.storage);
    this.userState = new UserState(this.storage);

    this.handlers = {
      echo: new EchoHandler(),
      demo: new DemoHandler(),
      ai: new AIHandler(config.getAzureOpenAIConfig(), this.logger),
    };

    this.registerCommands();
  }

  async process(req: Request, res: Response) {
    return this.adapter.process(req, res, this.logic.bind(this));
  }

  private registerCommands() {
    this.commandExecutor.register(new ListModeCommand(Object.keys(this.handlers)));
    this.commandExecutor.register(new SetModeCommand(this.userState));
    this.commandExecutor.register(new GetModeCommand(this.userState));
    this.commandExecutor.register(new MenuCommand());
    this.commandExecutor.register(new HelpCommand(this.commandExecutor));
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
      const handler = await this.getHandler(context);
      await handler.run(context);
    }
  }

  private async getHandler(context: TurnContext): Promise<ActivityHandler> {
    const userModeAccessor = this.userState.createProperty<string>(USER_MODE_STATE_KEY);
    const mode = await userModeAccessor.get(context);

    if (mode && mode in this.handlers) {
      return this.handlers[mode];
    } else {
      return this.handlers.echo; // default handler
    }
  }
}
