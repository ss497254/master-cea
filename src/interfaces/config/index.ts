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

export interface ILoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFileLogging?: boolean;
}

export interface IAppConfig {
  bot: AuthConfiguration;
  azureOpenAI: IAzureOpenAIConfig;
  logging: ILoggingConfig;
  environment: 'development' | 'production' | 'staging';
  port: number;
  assetsPath?: string;
}

// Configuration loader interface
export { IConfigLoader } from './config-loader';
