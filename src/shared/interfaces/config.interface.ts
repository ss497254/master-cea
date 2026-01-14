/**
 * Configuration interfaces for the application
 */
import { AuthConfiguration } from "@microsoft/agents-hosting";

export interface IAzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
  maxTokens: number;
  temperature: number;
}

export interface ILoggingConfig {
  level: "debug" | "info" | "warn" | "error";
  enableConsole: boolean;
  enableFileLogging?: boolean;
}

export interface ICommandConfig {
  enableCommands: boolean;
  prefix: string;
}

export type StorageConfig =
  | {
    type: "memory";
  }
  | {
    type: "file";
    filePath: string;
  }
  | {
    type: "blob";
    containerId: string;
    connectionString: string;
  }
  | {
    type: "cosmosdb";
    databaseId: string;
    containerId: string;
    cosmosClientOptions: {
      endpoint: string;
      key: string;
    };
  };

export interface IToolsConfig {
  /** Enable built-in tools (math solver, etc.) */
  enableBuiltinTools: boolean;
  /** Maximum tool execution steps for agentic loops */
  maxToolSteps: number;
}

export interface IAppConfig {
  bot: AuthConfiguration;
  azureOpenAI: IAzureOpenAIConfig;
  logging: ILoggingConfig;
  storage: StorageConfig;
  commands: ICommandConfig;
  tools: IToolsConfig;
  environment: "development" | "production" | "staging";
  port: number;
  assetsDir: string;
  basePath: string;
}

/**
 * Abstract base class for configuration loaders
 */
export interface IConfigLoader {
  getSource(): string;
  loadConfiguration(): IAppConfig | Promise<IAppConfig>;
}

export interface IConfigurationService {
  load(): Promise<void>;
  getConfig(): IAppConfig;
  getBotConfig(): AuthConfiguration;
  getAzureOpenAIConfig(): IAzureOpenAIConfig;
  getCommandConfig(): ICommandConfig;
  getStorageConfig(): StorageConfig;
  getToolsConfig(): IToolsConfig;
  isConfigLoaded(): boolean;
  isProduction(): boolean;
  isDevelopment(): boolean;
  getPort(): number;
  getLogLevel(): string;
  isConsoleLoggingEnabled(): boolean;
  getAssetsDir(): string;
  getBasePath(): string;
}
