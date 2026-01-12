import { ActivityHandler } from "@microsoft/agents-hosting";
import { AdminHandler } from "./admin";
import { AIHandler } from "./ai";
import { DemoHandler } from "./demo";
import { EchoHandler } from "./echo";
import { EchoActivityHandler } from "./echo-activity";
import { ILogger } from "src/interfaces/services/logger";
import { ConfigurationService } from "src/core/services/configuration-service";

export function getActivityHandlers(config: ConfigurationService, logger: ILogger): Record<string, ActivityHandler> {
  return {
    echo: new EchoHandler(),
    "echo-activity": new EchoActivityHandler(),
    demo: new DemoHandler(config.getBotConfig(), logger),
    ai: new AIHandler(config.getAzureOpenAIConfig(), logger),
    admin: new AdminHandler(),
  };
}
