import { AuthConfiguration } from "@microsoft/agents-hosting";
import { IAppConfig, IAzureOpenAIConfig, ILogger } from "src/shared/interfaces";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigValidator {
  constructor(private logger: ILogger) {}

  public validateConfiguration(config: IAppConfig): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Validate Azure OpenAI configuration
    this.validateAzureOpenAIConfig(config.azureOpenAI, result);

    // Validate Bot configuration
    this.validateBotConfig(config.bot, result);

    // Validate port configuration
    this.validatePortConfig(config.port, result);

    if (result.errors.length > 0) {
      result.isValid = false;
    }

    this.logValidationResults(result);

    return result;
  }

  private validateAzureOpenAIConfig(config: IAzureOpenAIConfig, result: ValidationResult): void {
    if (!config.apiKey) {
      result.errors.push("Azure OpenAI API Key is required");
    }

    if (!config.endpoint) {
      result.errors.push("Azure OpenAI Endpoint is required");
    }

    if (config.endpoint && !this.isValidUrl(config.endpoint)) {
      result.errors.push("Azure OpenAI Endpoint must be a valid URL");
    }

    if (config.maxTokens <= 0 || config.maxTokens > 32000) {
      result.warnings.push("Azure OpenAI max tokens should be between 1 and 32000");
    }

    if (config.temperature < 0 || config.temperature > 2) {
      result.warnings.push("Azure OpenAI temperature should be between 0 and 2");
    }

    if (!config.deploymentName) {
      result.warnings.push("Azure OpenAI deployment name not specified, using default: gpt-4");
    }
  }

  private validateBotConfig(config: AuthConfiguration, result: ValidationResult): void {
    if (!config.clientId) {
      result.errors.push("Bot client ID is required");
    }

    if (!config.clientSecret) {
      result.errors.push("Bot client secret is required");
    }
  }

  private validatePortConfig(port: number, result: ValidationResult): void {
    if (port < 1 || port > 65535) {
      result.errors.push("Port must be between 1 and 65535");
    }

    if (port < 1024) {
      result.warnings.push("Port is below 1024 - may require elevated privileges on some systems");
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private logValidationResults(result: ValidationResult): void {
    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        this.logger.error(`Configuration validation error: ${error}`);
      });
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        this.logger.warn(`Configuration validation warning: ${warning}`);
      });
    }

    if (result.isValid && result.warnings.length === 0) {
      this.logger.info("Configuration validation passed successfully");
    }
  }
}
