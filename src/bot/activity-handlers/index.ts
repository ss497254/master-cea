import { ActivityHandler } from "@microsoft/agents-hosting";
import { IConfigurationService, ILogger } from "src/shared/interfaces";
import { AdminHandler } from "./admin.handler";
import { DemoHandler } from "./demo.handler";
import { EchoHandler } from "./echo.handler";
import { EchoActivityHandler } from "./raw-activity.handler";

/** Available handler names for type-safe handler access */
export type HandlerName = "echo" | "raw-activity" | "demo" | "admin";

export function getActivityHandlers(
  config: IConfigurationService,
  logger: ILogger
): Record<HandlerName, ActivityHandler> {
  return {
    echo: new EchoHandler(logger),
    demo: new DemoHandler(config.getBotConfig(), logger),
    admin: new AdminHandler(logger),
    "raw-activity": new EchoActivityHandler(logger),
  };
}
