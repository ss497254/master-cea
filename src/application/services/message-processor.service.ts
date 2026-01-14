import { CloudAdapter, UserState, type Request } from "@microsoft/agents-hosting";
import { type Response } from "express";
import { GetModeCommand, ListModeCommand, MenuCommand, SetModeCommand } from "src/application/commands";
import { getActivityHandlers } from "src/bot/activity-handlers";
import { createChatHandler } from "src/bot/chat-handler";
import { CommandExecutor } from "src/domain/commands";
import { UserPreferencesRepository } from "src/domain/repositories";
import { createAdapter } from "src/infrastructure/adapter";
import { ConfigurationService } from "src/infrastructure/config";
import { createStorage } from "src/infrastructure/storage";
import { ILogger } from "src/shared/interfaces";
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
    this.adapter = createAdapter();
    // Just to make typeScript happy
    this.router = this.initializeRouter();
  }

  async process(req: Request, res: Response): Promise<void> {
    return this.adapter.process(req, res, context => this.router.route(context));
  }

  private initializeRouter() {
    // Create infrastructure
    const storage = createStorage(this.config.getStorageConfig());
    const userState = new UserState(storage);
    const userPreferences = new UserPreferencesRepository(userState);

    // Create chat handler and commands
    const chatHandler = createChatHandler(this.config, this.logger);
    const commandExecutor = new CommandExecutor(this.config.getCommandConfig());

    // Create router (handles both routing and handler registration)
    this.router = new MessageRouterService(this.config, commandExecutor, userPreferences, chatHandler);

    // Register activity handlers
    this.router.registerHandlers(getActivityHandlers(this.config, this.logger));

    // Register commands
    commandExecutor.register(new MenuCommand());
    commandExecutor.register(new ListModeCommand(this.router.getHandlerNames.bind(this.router)));
    commandExecutor.register(new SetModeCommand(userPreferences));
    commandExecutor.register(new GetModeCommand(userPreferences));

    return this.router;
  }
}
