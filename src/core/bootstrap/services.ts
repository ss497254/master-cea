import { container } from "tsyringe";
import { ConfigurationService, LoggerService, MessageProcessorService } from "../services";

export function registerServices() {
  const logger = new LoggerService();
  const config = new ConfigurationService(logger);

  container.register<LoggerService>(LoggerService, { useValue: logger });
  container.register<ConfigurationService>(ConfigurationService, { useValue: config });
  container.register<MessageProcessorService>(MessageProcessorService, {
    useFactory: () => new MessageProcessorService(config, logger),
  });
}
