import { authorizeJWT, type Request } from '@microsoft/agents-hosting';
import { json, Router, type Response } from 'express';
import { container } from 'tsyringe';
import { EchoHandler } from '../activity-handlers/echo';
import { createAdapter } from '../adapter';
import { ConfigurationService, LoggerService } from '../services';

export function getMessagesRoutes() {
  const router = Router();
  const adapter = createAdapter();
  const config = container.resolve<ConfigurationService>(ConfigurationService);
  const logger = container.resolve<LoggerService>(LoggerService);
  const echoBot = new EchoHandler();

  router.use('/messages', authorizeJWT(config.getBotConfig()), json());

  router.post('/messages', async (req: Request, res: Response) => {
    try {
      await adapter.process(req, res, async context => {
        await echoBot.run(context);
      });
    } catch (error) {
      logger.error('Error processing request:', error as Error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Sorry, I encountered an error processing your request.',
      });
    }
  });

  return router;
}
