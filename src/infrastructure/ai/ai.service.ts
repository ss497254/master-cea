import { AzureOpenAIProvider, createAzure } from "@ai-sdk/azure";
import { stepCountIs, streamText } from "ai";
import { AIStreamPart, IAIService, IAIStreamOptions, IAzureOpenAIConfig } from "src/shared/interfaces";

/**
 * Azure OpenAI implementation of the AI service
 */
export class AzureAIService implements IAIService {
  private readonly azure: AzureOpenAIProvider;

  constructor(private config: IAzureOpenAIConfig) {
    this.azure = createAzure({
      apiKey: config.apiKey,
      apiVersion: config.apiVersion,
      baseURL: config.endpoint,
    });
  }

  async *generateStream(options: IAIStreamOptions): AsyncIterable<AIStreamPart> {
    const hasTools = options.tools && Object.keys(options.tools).length > 0;

    const { fullStream } = streamText({
      model: this.azure(this.config.deploymentName),
      system: options.system,
      prompt: options.prompt,
      tools: hasTools ? options.tools : undefined,
      stopWhen: hasTools && options.maxToolSteps ? stepCountIs(options.maxToolSteps) : undefined,
    });

    for await (const part of fullStream) {
      switch (part.type) {
        case "text-delta":
          yield { type: "text-delta", text: part.text };
          break;
        case "tool-call":
          yield {
            type: "tool-call",
            toolName: part.toolName,
            toolCallId: part.toolCallId,
            args: part.input,
          };
          break;
        case "tool-result":
          yield {
            type: "tool-result",
            toolName: part.toolName,
            toolCallId: part.toolCallId,
            result: part.output,
          };
          break;
        case "error":
          yield { type: "error", error: part.error };
          break;
        case "finish":
          yield { type: "finish", finishReason: part.finishReason };
          break;
      }
    }
  }
}
