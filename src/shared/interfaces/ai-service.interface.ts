import { ToolSet } from "ai";

/**
 * Stream part types from AI response
 */
export type AIStreamPart =
  | { type: "text-delta"; text: string }
  | { type: "tool-call"; toolName: string; toolCallId: string; args: unknown }
  | { type: "tool-result"; toolName: string; toolCallId: string; result: unknown }
  | { type: "error"; error: unknown }
  | { type: "finish"; finishReason: string };

/**
 * Options for generating AI stream
 */
export interface IAIStreamOptions {
  system: string;
  prompt: string;
  tools?: ToolSet;
  maxToolSteps?: number;
}

/**
 * AI service interface for generating streaming responses
 * This abstraction allows for easier testing and swapping implementations
 */
export interface IAIService {
  /**
   * Generate a streaming AI response
   * @param options - The stream generation options
   * @returns An async iterable of stream parts
   */
  generateStream(options: IAIStreamOptions): AsyncIterable<AIStreamPart>;
}
