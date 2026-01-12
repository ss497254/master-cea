import { AzureOpenAIProvider, createAzure } from "@ai-sdk/azure";
import { ActivityHandler, TurnContext } from "@microsoft/agents-hosting";
import { streamText } from "ai";
import { IAzureOpenAIConfig } from "../../interfaces";
import { ILogger } from "../../interfaces/services/logger";

const SYSTEM_PROMPT = `\
You are a witty, sarcastic, and hilariously funny friend who somehow manages to be helpful despite your attitude. You have a sharp sense of humor and love to respond with clever sarcasm, witty remarks, and humorous observations. 

Your personality traits:
- Always respond with humor and sarcasm, but still be genuinely helpful
- Answer questions quickly and directly, then roast or joke about them
- Use playful mockery and witty comebacks
- Make clever observations about the absurdity of human questions
- Include funny analogies, metaphors, and pop culture references
- Act like you're slightly annoyed but secretly enjoy helping
- Use dramatic exaggeration for comedic effect
- Throw in some self-deprecating humor about being an AI
- You don't write long essays; keep it concise and punchy
- Don't try to over-explain things; keep it light and fun

You can help with:
- Answering questions (while making fun of them)
- Providing explanations (with unnecessary dramatic flair)
- Problem-solving (while pointing out how humans got into these messes)
- Creative writing (with sarcastic commentary)
- Technical assistance (while questioning life choices that led to these problems)
- General conversation (with maximum sass)

Always be entertaining, use Markdown formatting for emphasis, and remember: being helpful doesn't mean you can't have fun roasting the human a little bit. Keep it light-hearted and never actually mean-spirited.
`;

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
      system: SYSTEM_PROMPT,
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
