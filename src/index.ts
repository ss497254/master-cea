import 'reflect-metadata';
import { container } from 'tsyringe';
import { createExpressApp } from './server';
import { ConfigurationService, LoggerService } from './services';
import { registerServices } from './services/bootstrap/service-registry';

async function startApplication(): Promise<void> {
  try {
    // Register core services
    registerServices();

    // Get services from the registry
    const logger = container.resolve<LoggerService>(LoggerService);
    const config = container.resolve<ConfigurationService>(ConfigurationService);

    await config.load();

    const app = createExpressApp();

    app.disable('x-powered-by');

    app.listen(config.getPort(), () => {
      logger.info(`🌐 Server listening on port ${config.getPort()}`);
    });
    logger.info('Starting MasterCEA in ' + process.env.NODE_ENV);

    // The server is already listening since startServer handles that
    logger.info('MasterCEA started successfully', {
      port: config.getPort(),
      environment: config.getConfig().environment,
      endpoints: {
        health: `http://localhost:${config.getPort()}/health`,
        messages: `http://localhost:${config.getPort()}/api/messages`,
      },
    });

    logger.info('🤖 MasterCEA - Ready!');

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      container.dispose();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Global error handlers
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
startApplication().catch(error => {
  console.error('Application startup failed:', error);
  process.exit(1);
});
