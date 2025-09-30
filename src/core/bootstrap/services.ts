import { container } from 'tsyringe';
import { ConfigurationService, LoggerService } from '../services';

export function registerServices() {
  const logger = new LoggerService();

  container.register<LoggerService>(LoggerService, { useValue: logger });
  container.register<ConfigurationService>(ConfigurationService, { useValue: new ConfigurationService(logger) });
}
