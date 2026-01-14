import { CloudAdapter } from "@microsoft/agents-hosting";
import { ConfigurationService } from "src/infrastructure/config";
import type { IConfigurationService } from "src/shared/interfaces";
import { container } from "tsyringe";

export function createAdapter(): CloudAdapter {
  // Get configuration from service registry
  const config = container.resolve<IConfigurationService>(ConfigurationService);

  return new CloudAdapter(config.getBotConfig());
}
