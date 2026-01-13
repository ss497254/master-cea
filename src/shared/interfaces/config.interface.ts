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

export interface IOrchestratorConfig {
  enabled: boolean;
  deploymentName: string;
  cacheTTL: number; // seconds
}

export interface IAppConfig {
  bot: AuthConfiguration;
  azureOpenAI: IAzureOpenAIConfig;
  orchestrator: IOrchestratorConfig;
  logging: ILoggingConfig;
  storage: StorageConfig;
  commands: ICommandConfig;
  environment: "development" | "production" | "staging";
  port: number;
  assetsDir: string;
  basePath: string;
}

/**
 * Abstract base class for configuration loaders
 */
export abstract class IConfigLoader {
  abstract getSource(): string;
  abstract loadConfiguration(): IAppConfig | Promise<IAppConfig>;
}
