import { CloudAdapter, UserState, type Request } from "@microsoft/agents-hosting";
import { type Response } from "express";
import { createAdapter } from "src/adapter";
import { getActivityHandlers } from "src/bot/activity-handlers";
import { GetModeCommand, HelpCommand, ListModeCommand, MenuCommand, SetModeCommand } from "src/commands";
import { ILogger } from "src/shared/interfaces";
import { CommandExecutor, CommandParser } from "src/core/commands";
import { UserPreferencesRepository } from "src/core/repositories";
import { ConfigurationService } from "./configuration.service";
import { HandlerRegistryService } from "./handler-registry.service";
import { MessageRouterService } from "./message-router.service";
import { OrchestratorService } from "./orchestrator.service";
import { createStorage } from "./storage.factory";

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

    // Create domain services
    const orchestrator = new OrchestratorService(
      config.getAzureOpenAIConfig(),
      config.getOrchestratorConfig(),
      userState,
      this.logger
    );

    const handlerRegistry = new HandlerRegistryService(userPreferences, orchestrator, this.logger);
    handlerRegistry.registerAll(getActivityHandlers(this.config, this.logger));

    const commandParser = new CommandParser(this.config.getCommandConfig());
    const commandExecutor = new CommandExecutor(this.config.getCommandConfig());
    this.registerCommands(commandExecutor, handlerRegistry, userPreferences);

    // Create router
    this.router = new MessageRouterService(commandParser, commandExecutor, handlerRegistry);
  }

  async process(req: Request, res: Response): Promise<void> {
    return this.adapter.process(req, res, context => this.router.route(context));
  }

  private registerCommands(
    commandExecutor: CommandExecutor,
    handlerRegistry: HandlerRegistryService,
    userPreferences: UserPreferencesRepository
  ): void {
    commandExecutor.register(new ListModeCommand(handlerRegistry.getHandlerNames()));
    commandExecutor.register(new SetModeCommand(userPreferences));
    commandExecutor.register(new GetModeCommand(userPreferences));
    commandExecutor.register(new MenuCommand());
    commandExecutor.register(new HelpCommand(commandExecutor));
  }
}
