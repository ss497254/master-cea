import express, { Router } from "express";
import { ConfigurationService } from "src/infrastructure/config";
import { LoggerService } from "src/infrastructure/logging";
import { container } from "tsyringe";
import { getMessagesRoute } from "./routes";

export function createExpressRouter() {
  const router = Router({ strict: true });
  const config = container.resolve<ConfigurationService>(ConfigurationService);
  const logger = container.resolve<LoggerService>(LoggerService);
  const environment = config.getConfig().environment;

  router.get("/", (_req, res) => {
    res.send(`Hello, this is the Master CEA${config.isProduction() ? "" : `(${environment})`}!`);
  });

  router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  router.use("/api/messages", getMessagesRoute());
  router.use("/assets", express.static(config.getAssetsDir()));

  // 404 handler - must be after all routes
  router.get("*", (_req, res) => {
    res.status(404).send("Not Found");
  });

  // Error handler - must be last
  router.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error("Error processing request:", err, {
      url: req.url,
      method: req.method,
    });
    res.status(500).send("Something broke!");
  });

  return router;
}
