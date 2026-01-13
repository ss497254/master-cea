import { AzureOpenAIProvider, createAzure } from "@ai-sdk/azure";
import { ActivityHandler, TurnContext } from "@microsoft/agents-hosting";
import { streamText } from "ai";
import { AI_SYSTEM_PROMPT } from "src/infrastructure/config/prompts";
import { IAzureOpenAIConfig, ILogger } from "src/shared/interfaces";

export class AIHandler extends ActivityHandler {
  private readonly azure: AzureOpenAIProvider;

  constructor(
    private config: IAzureOpenAIConfig,
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
          await context.sendActivity(
            "Hello! I'm your AI assistant. Feel free to ask me anything - questions, help with tasks, creative writing, or just have a conversation!"
          );
        }
      }
      await next();
    });

    this.onMessage(async (context, next) => {
      await this.handleMessage(context);
      await next();
    });
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

    const { fullStream } = streamText({
      model: this.azure(this.config.deploymentName),
      system: AI_SYSTEM_PROMPT,
      prompt: message,
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
          case "error": {
            const error = part.error;
            throw new Error(`Error in streaming: ${error}`);
            break;
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
}
