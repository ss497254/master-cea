import { ConfigurationService } from "src/infrastructure/config";
import { createToolRegistry } from "src/infrastructure/tools";
import { ILogger } from "src/shared/interfaces";
import { ChatHandler } from "./chat.handler";

export function createChatHandler(config: ConfigurationService, logger: ILogger): ChatHandler {
  // Create tool registry
  const toolsConfig = config.getToolsConfig();
  const toolRegistry = createToolRegistry(toolsConfig, logger);

  // Create chat handler with tools
  return new ChatHandler(config.getAzureOpenAIConfig(), toolsConfig, toolRegistry, logger);
}

export { ChatHandler } from "./chat.handler";
