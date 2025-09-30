import express from 'express';
import { container } from 'tsyringe';
import { getMessagesRoutes } from './routes';
import { ConfigurationService, LoggerService } from './core/services';

export function createExpressApp() {
  const app = express();
  const config = container.resolve<ConfigurationService>(ConfigurationService);
  const logger = container.resolve<LoggerService>(LoggerService);
  const environment = config.getConfig().environment;

  app.get('/', (_req, res) => {
    res.send(`Hello, this is the Master CEA${config.isProduction() ? '' : `(${environment})`}!`);
  });

  app.use('/api', getMessagesRoutes());
  app.use('/assets', express.static(config.getAssetsPath()));

  app.get('', (req, res) => {
    res.status(404).send('Not Found');
  });

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Error processing request:', err, { url: req.url, method: req.method });
    res.status(500).send('Something broke!');
  });

  return app;
}
