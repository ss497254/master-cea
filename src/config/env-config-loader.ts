import { AuthConfiguration } from '@microsoft/agents-hosting';
import dotenv from 'dotenv';
import { IAppConfig, IAzureOpenAIConfig, IConfigLoader } from '../interfaces';
import { ILogger } from '../interfaces/services/logger';

export class EnvironmentConfigLoader extends IConfigLoader {
  constructor(private logger: ILogger) {
    super();
    dotenv.config(); // Load .env file if present
  }

  public getSource(): string {
    return 'environment';
  }

  public loadConfiguration(): IAppConfig {
    this.logger.debug('Loading configuration from environment variables');

    return {
      environment: this.getEnvironment(),
      bot: this.loadBotConfig(),
      azureOpenAI: this.loadAzureOpenAIConfig(),
      logging: this.loadLoggingConfig(),
      port: this.getPort(),
    };
  }

  private getEnvironment(): 'development' | 'production' | 'staging' {
    return (process.env.NODE_ENV as 'development' | 'production' | 'staging') || 'development';
  }

  private loadBotConfig(): AuthConfiguration {
    const authority = process.env.AUTHORITY || 'https://login.microsoftonline.com';

    return {
      clientId: process.env.BOT_ID || '',
      tenantId: process.env.TENANT_ID || '',
      clientSecret: process.env.BOT_PASSWORD || '',
      authority,
      issuers: [
        'https://api.botframework.com',
        `https://sts.windows.net/${process.env.tenantId}/`,
        `${authority}/${process.env.tenantId}/v2.0`,
      ],
    };
  }

  private loadAzureOpenAIConfig(): IAzureOpenAIConfig {
    return {
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
      maxTokens: parseInt(process.env.AZURE_OPENAI_MAX_TOKENS || '2000', 10),
      temperature: parseFloat(process.env.AZURE_OPENAI_TEMPERATURE || '0.7'),
    };
  }

  private loadLoggingConfig() {
    return {
      level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
    };
  }

  private getPort(): number {
    return parseInt(process.env.PORT || '3978', 10);
  }
}
