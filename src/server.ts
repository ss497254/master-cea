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

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', getMessagesRoutes());
  app.use('/assets', express.static(config.getAssetsPath()));

  // 404 handler - must be after all routes
  app.get('', (req, res) => {
    res.status(404).send('Not Found');
  });

  // Error handler - must be last
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Error processing request:', err, { url: req.url, method: req.method });
    res.status(500).send('Something broke!');
  });

  return app;
}
