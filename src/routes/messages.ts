import { authorizeJWT, type Request } from '@microsoft/agents-hosting';
import { json, Router, type Response } from 'express';
import { container } from 'tsyringe';
import { ConfigurationService, LoggerService, MessageProcessorService } from '../core/services';

export function getMessagesRoutes() {
  const router = Router({ strict: true });
  const config = container.resolve<ConfigurationService>(ConfigurationService);
  const logger = container.resolve<LoggerService>(LoggerService);
  const messageProcessor = container.resolve<MessageProcessorService>(MessageProcessorService);

  router.use('/messages', authorizeJWT(config.getBotConfig()), json());

  router.post('/messages', async (req: Request, res: Response) => {
    try {
      await messageProcessor.process(req, res);
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
