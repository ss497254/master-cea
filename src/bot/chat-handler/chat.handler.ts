import { AzureOpenAIProvider, createAzure } from "@ai-sdk/azure";
import { ActivityTypes } from "@microsoft/agents-activity";
import { ActivityHandler, TurnContext } from "@microsoft/agents-hosting";
import { stepCountIs, streamText } from "ai";
import { AI_SYSTEM_PROMPT } from "src/infrastructure/config/prompts";
import { IToolRegistry } from "src/infrastructure/tools/registry/tool-registry.interface";
import { IAzureOpenAIConfig, ILogger, IToolsConfig } from "src/shared/interfaces";

export class ChatHandler extends ActivityHandler {
  private readonly azure: AzureOpenAIProvider;

  constructor(
    private config: IAzureOpenAIConfig,
    private toolsConfig: IToolsConfig,
    private toolRegistry: IToolRegistry,
    private logger: ILogger
  ) {
    super();
    this.azure = createAzure({
      apiKey: config.apiKey,
      apiVersion: config.apiVersion,
      baseURL: config.endpoint,
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded!) {
        if (member.id !== context.activity.recipient!.id) {
          await this.sendWelcomeMessage(context);
        }
      }
      await next();
    });

    this.onMessage(async (context, next) => {
      await this.handleMessage(context);
      await next();
    });
  }

  protected async onTurnActivity(context: TurnContext) {
    switch (context.activity.type) {
      case ActivityTypes.Message:
        await this.handleMessage(context);
        break;
      case ActivityTypes.Invoke: {
        await this.handleInvoke(context);
        break;
      }
    }
  }

  private async handleMessage(context: TurnContext) {
    context.streamingResponse.setFeedbackLoop(true);
    context.streamingResponse.setGeneratedByAILabel(true);
    context.streamingResponse.setSensitivityLabel({
      type: "https://schema.org/Message",
      "@type": "CreativeWork",
      name: "Internal",
    });
    context.streamingResponse.queueInformativeUpdate("thinking...");

    const message = context.activity.text?.trim() || "";

    // Handle empty messages
    if (!message) {
      await context.sendActivity("Please ask me a question or let me know how I can help you!");
      return;
    }

    // Get tools from registry
    const tools = this.toolRegistry.getTools();
    const hasTools = Object.keys(tools).length > 0;

    const { fullStream } = streamText({
      model: this.azure(this.config.deploymentName),
      system: AI_SYSTEM_PROMPT,
      prompt: message,
      tools: hasTools ? tools : undefined,
      stopWhen: hasTools ? stepCountIs(this.toolsConfig.maxToolSteps) : undefined,
    });

    try {
      for await (const part of fullStream) {
        switch (part.type) {
          case "text-delta": {
            if (part.text.length > 0) {
              context.streamingResponse.queueTextChunk(part.text);
            }
            break;
          }
          case "tool-call": {
            // Notify user that a tool is being used
            context.streamingResponse.queueInformativeUpdate(`Using ${part.toolName}...`);
            this.logger.debug("Tool call initiated", {
              tool: part.toolName,
              callId: part.toolCallId,
            });
            break;
          }
          case "tool-result": {
            this.logger.debug("Tool result received", {
              tool: part.toolName,
              callId: part.toolCallId,
            });
            break;
          }
          case "error": {
            const error = part.error;
            throw new Error(`Error in streaming: ${error}`);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error during AI streaming:", new Error(errorMessage));
      context.streamingResponse.queueTextChunk(
        "I apologize, but I encountered an error while processing your request. Please try again later."
      );
    } finally {
      await context.streamingResponse.endStream();
      this.logger.info("AI streaming completed");
    }
  }

  private async handleInvoke(context: TurnContext) {
    // Placeholder for handling invoke activities if needed in the future
    this.logger.info("Received invoke activity", { activity: context.activity });
  }

  private async sendWelcomeMessage(context: TurnContext) {
    await context.sendActivity(
      "Hello! I'm your AI assistant. Feel free to ask me anything - questions, help with tasks, creative writing, or just have a conversation!"
    );
  }
}
