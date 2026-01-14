import { AzureAIService } from "src/infrastructure/ai";
import { IConfigurationService, ILogger } from "src/shared/interfaces";
import { ChatHandler } from "./chat.handler";
import { chatTools } from "./tools";

export function createChatHandler(config: IConfigurationService, logger: ILogger): ChatHandler {
  const toolsConfig = config.getToolsConfig();
  const tools = toolsConfig.enableBuiltinTools ? chatTools : {};
  const aiService = new AzureAIService(config.getAzureOpenAIConfig());

  return new ChatHandler(aiService, toolsConfig, tools, logger);
}

export { ChatHandler } from "./chat.handler";
