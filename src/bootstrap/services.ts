import { container } from "tsyringe";
import { MessageProcessorService } from "src/application/services";
import { ConfigurationService } from "src/infrastructure/config";
import { LoggerService } from "src/infrastructure/logging";

export function registerServices() {
  const logger = new LoggerService();
  const config = new ConfigurationService(logger);

  container.register<LoggerService>(LoggerService, { useValue: logger });
  container.register<ConfigurationService>(ConfigurationService, { useValue: config });
  container.register<MessageProcessorService>(MessageProcessorService, {
    useFactory: () => new MessageProcessorService(config, logger),
  });
}
