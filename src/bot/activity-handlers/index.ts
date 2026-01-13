import { ActivityHandler } from "@microsoft/agents-hosting";
import { ConfigurationService } from "src/core/services/configuration.service";
import { ILogger } from "src/shared/interfaces";
import { AdminHandler } from "./admin";
import { AIHandler } from "./ai";
import { DemoHandler } from "./demo";
import { EchoActivityHandler } from "./echo-activity";
import { EchoHandler } from "./echo";

/** Available handler names for type-safe handler access */
export type HandlerName = "echo" | "echo-activity" | "demo" | "ai" | "admin";

export function getActivityHandlers(
  config: ConfigurationService,
  logger: ILogger
): Record<HandlerName, ActivityHandler> {
  return {
    echo: new EchoHandler(logger),
    "echo-activity": new EchoActivityHandler(logger),
    demo: new DemoHandler(config.getBotConfig(), logger),
    ai: new AIHandler(config.getAzureOpenAIConfig(), logger),
    admin: new AdminHandler(logger),
  };
}
