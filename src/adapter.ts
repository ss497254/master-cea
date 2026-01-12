import { CloudAdapter } from "@microsoft/agents-hosting";
import { container } from "tsyringe";
import { ConfigurationService } from "./core/services";

export function createAdapter(): CloudAdapter {
  // Get configuration from service registry
  const config = container.resolve<ConfigurationService>(ConfigurationService);

  return new CloudAdapter(config.getBotConfig());
}
