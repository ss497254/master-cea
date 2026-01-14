import { AuthConfiguration } from "@microsoft/agents-hosting";
import dotenv from "dotenv";
import type {
  IAppConfig,
  IAzureOpenAIConfig,
  IConfigLoader,
  ILogger,
  IToolsConfig,
} from "src/shared/interfaces";

export class EnvironmentConfigLoader implements IConfigLoader {
  constructor(private logger: ILogger) {
    if (this.getEnvironment() !== "production") {
      dotenv.config(); // Load .env file in non-production environments
      this.logger.debug("Environment variables loaded by dotenv");
    }
  }

  public getSource(): string {
    return "environment";
  }

  public loadConfiguration(): IAppConfig {
    this.logger.debug("Loading configuration from environment variables");

    return {
      azureOpenAI: this.loadAzureOpenAIConfig(),
      bot: this.loadBotConfig(),
      commands: this.loadCommandConfig(),
      storage: this.loadStorageConfig(),
      logging: this.loadLoggingConfig(),
      tools: this.loadToolsConfig(),
      environment: this.getEnvironment(),
      port: this.getPort(),
      assetsDir: process.env.ASSETS_DIR || "assets",
      basePath: process.env.BASE_PATH || "/",
    };
  }

  private getEnvironment(): "development" | "production" | "staging" {
    return (process.env.NODE_ENV as "development" | "production" | "staging") || "development";
  }

  private loadBotConfig(): AuthConfiguration {
    const authority = process.env.AUTHORITY || "https://login.microsoftonline.com";

    return {
      clientId: process.env.BOT_ID || "",
      tenantId: process.env.TENANT_ID || "",
      clientSecret: process.env.BOT_PASSWORD || "",
      authority,
      issuers: [
        "https://api.botframework.com",
        `https://sts.windows.net/${process.env.TENANT_ID}/`,
        `${authority}/${process.env.TENANT_ID}/v2.0`,
      ],
    };
  }

  private loadAzureOpenAIConfig(): IAzureOpenAIConfig {
    return {
      apiKey: process.env.AZURE_OPENAI_API_KEY || "",
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4",
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview",
      maxTokens: parseInt(process.env.AZURE_OPENAI_MAX_TOKENS || "2000", 10),
      temperature: parseFloat(process.env.AZURE_OPENAI_TEMPERATURE || "0.7"),
    };
  }

  private loadLoggingConfig() {
    return {
      level: (process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error") || "info",
      enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== "false",
    };
  }

  private loadCommandConfig() {
    return {
      enableCommands: process.env.ENABLE_COMMANDS === "true",
      prefix: process.env.COMMAND_PREFIX || "$",
    };
  }

  private loadStorageConfig() {
    const type = process.env.STORAGE_TYPE || "memory";
    switch (type) {
      case "memory":
        return { type: "memory" } as const;
      case "file":
        return {
          type: "file",
          filePath: process.env.STORAGE_FOLDER_PATH || "./.bot-storage",
        } as const;
      case "blob":
        return {
          type: "blob",
          containerId: process.env.BLOB_CONTAINER_ID || "bot-container",
          connectionString: process.env.BLOB_CONNECTION_STRING || "",
        } as const;
      case "cosmosdb":
        return {
          type: "cosmosdb",
          databaseId: process.env.COSMOSDB_DATABASE_ID || "BotDatabase",
          containerId: process.env.COSMOSDB_CONTAINER_ID || "BotContainer",
          cosmosClientOptions: {
            endpoint: process.env.COSMOSDB_ENDPOINT || "",
            key: process.env.COSMOSDB_KEY || "",
          },
        } as const;
      default:
        this.logger.warn(`Unknown STORAGE_TYPE "${type}", defaulting to memory storage.`);
        return { type: "memory" } as const;
    }
  }

  private loadToolsConfig(): IToolsConfig {
    return {
      enableBuiltinTools: process.env.TOOLS_ENABLED !== "false",
      maxToolSteps: parseInt(process.env.TOOLS_MAX_STEPS || "5", 10),
    };
  }

  private getPort(): number {
    return parseInt(process.env.PORT || "8080", 10);
  }
}
