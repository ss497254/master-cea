import { CloudAdapter } from "@microsoft/agents-hosting";
import { ConfigurationService } from "src/infrastructure/config";
import { container } from "tsyringe";

export function createAdapter(): CloudAdapter {
  // Get configuration from service registry
  const config = container.resolve<ConfigurationService>(ConfigurationService);

  return new CloudAdapter(config.getBotConfig());
}
