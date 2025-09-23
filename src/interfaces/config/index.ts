/**
 * Configuration interfaces for the application
 */

import { AuthConfiguration } from '@microsoft/agents-hosting';

export interface IAzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
  maxTokens: number;
  temperature: number;
}

export interface IAppConfig {
  bot: AuthConfiguration;
  azureOpenAI: IAzureOpenAIConfig;
  environment: 'development' | 'production' | 'staging';
  port: number;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
  };
}

// Configuration loader interface
export { IConfigLoader } from './config-loader';
