import { authorizeJWT, Request } from '@microsoft/agents-hosting';
import express, { Response } from 'express';
import { container } from 'tsyringe';
import { createAdapter } from './adapter';
import { ConfigurationService, LoggerService } from './services';

export function createExpressApp() {
  const app = express();
  const adapter = createAdapter();
  const config = container.resolve<ConfigurationService>(ConfigurationService);
  const logger = container.resolve<LoggerService>(LoggerService);

  app.get('/', (req, res) => {
    res.send('Hello, this is the Master CEA!');
  });

  app.use('/api/messages', authorizeJWT(config.getBotConfig()), express.json());

  app.post('/api/messages', async (req: Request, res: Response) => {
    try {
      await adapter.process(req, res, async context => {
        // await agentApp.run(context);
      });
    } catch (error) {
      logger.error('Error processing request:', error as Error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Sorry, I encountered an error processing your request.',
      });
    }
  });

  return app;
}
