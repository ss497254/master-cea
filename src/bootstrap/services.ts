import { container } from "tsyringe";
import { MessageProcessorService } from "src/application/services";
import { ConfigurationService } from "src/infrastructure/config";
import { LoggerService } from "src/infrastructure/logging";
import { IConfigurationService, ILogger } from "src/shared/interfaces";

export function registerServices() {
  const logger = new LoggerService();
  const config = new ConfigurationService(logger);

  container.register<ILogger>(LoggerService, { useValue: logger });
  container.register<IConfigurationService>(ConfigurationService, { useValue: config });
  container.register<MessageProcessorService>(MessageProcessorService, {
    useFactory: () => new MessageProcessorService(config, logger),
  });
}
