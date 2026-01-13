import express from "express";
import type { Server } from "http";
import "reflect-metadata";
import { registerServices } from "src/bootstrap";
import { ConfigurationService } from "src/infrastructure/config";
import { createExpressRouter } from "src/infrastructure/http";
import { LoggerService } from "src/infrastructure/logging";
import { container } from "tsyringe";

async function startApplication(): Promise<void> {
  try {
    // Register core services
    registerServices();

    // Get services from the registry
    const logger = container.resolve<LoggerService>(LoggerService);
    const config = container.resolve<ConfigurationService>(ConfigurationService);

    await config.load();

    const port = config.getPort();

    const app = express();
    app.use(config.getBasePath(), createExpressRouter());
    app.disable("x-powered-by");

    const server: Server = app.listen(port, error => {
      if (error) {
        logger.error("Error starting server: " + error.message);
      } else {
        logger.info(`🌐 Server listening on port ${port}`);
      }
    });
    logger.info("Starting MasterCEA in " + process.env.NODE_ENV);

    // The server is already listening since startServer handles that
    logger.info("MasterCEA started successfully", {
      port,
      environment: config.getConfig().environment,
      endpoints: {
        health: `http://localhost:${port}/health`,
        messages: `http://localhost:${port}/api/messages`,
      },
    });

    logger.info("🤖 MasterCEA - Ready!");

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      container.dispose();
      server.close(err => {
        if (err) {
          logger.error("Error closing server:", err);
        } else {
          logger.info("Server closed gracefully");
        }
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

// Global error handlers
process.on("uncaughtException", error => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the application
startApplication().catch(error => {
  console.error("Application startup failed:", error);
  process.exit(1);
});
