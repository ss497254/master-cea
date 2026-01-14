import { authorizeJWT, type Request } from "@microsoft/agents-hosting";
import { json, Router, type Response } from "express";
import { MessageProcessorService } from "src/application/services";
import { ConfigurationService } from "src/infrastructure/config";
import { LoggerService } from "src/infrastructure/logging";
import type { IConfigurationService, ILogger } from "src/shared/interfaces";
import { container } from "tsyringe";

export function getMessagesRoute() {
  const router = Router({ strict: true });
  const config = container.resolve<IConfigurationService>(ConfigurationService);
  const logger = container.resolve<ILogger>(LoggerService);
  const messageProcessor = container.resolve<MessageProcessorService>(MessageProcessorService);

  router.use("/", authorizeJWT(config.getBotConfig()), json());

  router.post("/", async (req: Request, res: Response) => {
    try {
      await messageProcessor.process(req, res);
    } catch (error) {
      logger.error("Error processing request:", error as Error);
      res.status(500).json({
        error: "Internal server error",
        message: "Sorry, I encountered an error processing your request.",
      });
    }
  });

  return router;
}
