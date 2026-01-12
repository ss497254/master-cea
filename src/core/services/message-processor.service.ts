import {
  ActivityHandler,
  CloudAdapter,
  ConversationState,
  FileStorage,
  MemoryStorage,
  Storage,
  TurnContext,
  UserState,
  type Request,
} from "@microsoft/agents-hosting";
import { type Response } from "express";
import { StorageConfig } from "src/interfaces";
import { createAdapter } from "../../adapter";
import { getActivityHandlers } from "../../bot/activity-handlers";
import { HelpCommand, ListModeCommand, MenuCommand, SetModeCommand } from "../../commands";
import { GetModeCommand } from "../../commands/get-mode";
import { USER_MODE_STATE_KEY } from "../../config/constants";
import { ILogger } from "../../interfaces/services/logger";
import { getMessageTextFromActivity } from "../../utils/helpers";
import { CommandExecutor, CommandParser } from "../commands";
import { ConfigurationService } from "./configuration-service";
import { OrchestratorService } from "./orchestrator.service";

export class MessageProcessorService {
  private adapter: CloudAdapter;
  private commandParser: CommandParser;
  private commandExecutor: CommandExecutor;
  private orchestrator: OrchestratorService;
  private handlers: Record<string, ActivityHandler>;
  private storage: Storage;
  private conversationState: ConversationState;
  private userState: UserState;

  constructor(
    private config: ConfigurationService,
    private logger: ILogger
  ) {
    this.adapter = createAdapter();
    this.commandParser = new CommandParser(this.config.getCommandConfig());
    this.commandExecutor = new CommandExecutor(this.config.getCommandConfig());
    this.storage = this.createStorage(this.config.getStorageConfig());
    this.conversationState = new ConversationState(this.storage);
    this.userState = new UserState(this.storage);

    this.orchestrator = new OrchestratorService(
      config.getAzureOpenAIConfig(),
      config.getOrchestratorConfig(),
      this.userState,
      this.logger
    );

    this.handlers = getActivityHandlers(this.config, this.logger);

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
      const handler = await this.getHandler(context, message || "");
      await handler.run(context);
    }
  }

  private async getHandler(context: TurnContext, message: string): Promise<ActivityHandler> {
    // Check if user has explicitly set a mode
    const userModeAccessor = this.userState.createProperty<string>(USER_MODE_STATE_KEY);
    const userMode = await userModeAccessor.get(context);

    // If user has set a mode, use it (overrides orchestrator)
    if (userMode && userMode in this.handlers) {
      return this.handlers[userMode];
    }

    // Use orchestrator if enabled
    if (this.orchestrator.isEnabled() && message) {
      const decision = await this.orchestrator.route(message, context);
      this.logger.debug("Orchestrator routing", {
        handler: decision.handler,
        capability: decision.capability,
        cached: decision.cached,
      });

      if (decision.handler in this.handlers) {
        return this.handlers[decision.handler];
      }
    }

    // Default to AI handler
    return this.handlers.ai;
  }

  private createStorage(config: StorageConfig): Storage {
    if (config.type === "file") {
      return new FileStorage(config.filePath);
    }

    // Add other storage types as needed
    return new MemoryStorage();
  }
}
