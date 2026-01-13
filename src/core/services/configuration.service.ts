import { AuthConfiguration } from "@microsoft/agents-hosting";
import { ConfigValidator, EnvironmentConfigLoader } from "src/config";
import { IAppConfig, IAzureOpenAIConfig, IOrchestratorConfig, ILogger } from "src/shared/interfaces";

export class ConfigurationService {
  private _config?: IAppConfig;
  private logger: ILogger;
  private validator: ConfigValidator;

  constructor(logger: ILogger) {
    this.logger = logger;
    this.validator = new ConfigValidator(logger);
  }

  private get config() {
    if (this._config) return this._config;

    throw new Error("Cannot access config before loading");
  }

  public async load(): Promise<void> {
    try {
      const envConfigLoader = new EnvironmentConfigLoader(this.logger);
      this._config = envConfigLoader.loadConfiguration();
      this.logger.info("Configuration loaded from environment variables");

      // Validate the loaded configuration
      this.validator.validateConfiguration(this.config);
    } catch (error) {
      this.logger.error("Failed to initialize configuration service", error as Error);
      throw error;
    }
  }

  public getConfig(): IAppConfig {
    return this.config;
  }
  public getBotConfig(): AuthConfiguration {
    return this.config.bot;
  }

  public getAzureOpenAIConfig(): IAzureOpenAIConfig {
    return this.config.azureOpenAI;
  }

  public getOrchestratorConfig(): IOrchestratorConfig {
    return this.config.orchestrator;
  }

  public getCommandConfig() {
    return this.config.commands;
  }

  public getStorageConfig() {
    return this.config.storage;
  }

  public isConfigLoaded(): boolean {
    return this._config !== undefined;
  }

  public isProduction(): boolean {
    return this.config.environment === "production";
  }

  public isDevelopment(): boolean {
    return this.config.environment === "development";
  }

  public getPort(): number {
    return this.config.port;
  }

  public getLogLevel(): string {
    return this.config.logging.level;
  }

  public isConsoleLoggingEnabled(): boolean {
    return this.config.logging.enableConsole;
  }

  public getAssetsDir(): string {
    return this.config.assetsDir;
  }

  public getBasePath(): string {
    return this.config.basePath;
  }
}
