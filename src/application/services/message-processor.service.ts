import { CloudAdapter, UserState, type Request } from "@microsoft/agents-hosting";
import { type Response } from "express";
import { GetModeCommand, ListModeCommand, MenuCommand, SetModeCommand } from "src/application/commands";
import { getActivityHandlers } from "src/bot/activity-handlers";
import { AIHandler } from "src/bot/main-handler/ai.handler";
import { CommandExecutor } from "src/domain/commands";
import { UserPreferencesRepository } from "src/domain/repositories";
import { createAdapter } from "src/infrastructure/adapter";
import { ConfigurationService } from "src/infrastructure/config";
import { createStorage } from "src/infrastructure/storage";
import { ILogger } from "src/shared/interfaces";
import { HandlerRegistryService } from "./handler-manager.service";
import { MessageRouterService } from "./message-router.service";

/**
 * Coordinates message processing by delegating to specialized services.
 * Acts as the composition root for the bot's message handling pipeline.
 */
export class MessageProcessorService {
  private adapter: CloudAdapter;
  private router: MessageRouterService;

  constructor(
    private config: ConfigurationService,
    private logger: ILogger
  ) {
    // Create infrastructure
    this.adapter = createAdapter();
    const storage = createStorage(this.config.getStorageConfig());
    const userState = new UserState(storage);
    const userPreferences = new UserPreferencesRepository(userState);

    // Create platform-specific handlers
    const ai = new AIHandler(config.getAzureOpenAIConfig(), this.logger);

    const handlerRegistry = new HandlerRegistryService(userPreferences, ai);
    handlerRegistry.registerAll(getActivityHandlers(this.config, this.logger));

    // Create commands
    const commandExecutor = new CommandExecutor(this.config.getCommandConfig());
    commandExecutor.register(new MenuCommand());
    commandExecutor.register(new ListModeCommand(handlerRegistry.getHandlerNames()));
    commandExecutor.register(new SetModeCommand(userPreferences));
    commandExecutor.register(new GetModeCommand(userPreferences));

    // Create router
    this.router = new MessageRouterService(config, commandExecutor, handlerRegistry);
  }

  async process(req: Request, res: Response): Promise<void> {
    return this.adapter.process(req, res, context => this.router.route(context));
  }
}
