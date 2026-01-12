import { IAppConfig } from "./index";

/**
 * Abstract base interface for configuration loaders
 */
export abstract class IConfigLoader {
  /**
   * Get the source identifier for this loader (e.g., 'environment', 'keyvault')
   * @returns Source identifier string
   */
  abstract getSource(): string;

  /**
   * Load configuration and return it
   * @returns Configuration object or Promise of configuration object
   */
  abstract loadConfiguration(): IAppConfig | Promise<IAppConfig>;
}
