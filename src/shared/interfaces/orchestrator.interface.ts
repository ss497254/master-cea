/**
 * Orchestrator interfaces for AI-based message routing
 */

export type HandlerType = "demo" | "ai" | "admin" | "echo";

export interface IRoutingDecision {
  handler: HandlerType;
  capability?: string;
  confidence: number;
  cached: boolean;
}

export interface ICachedDecision {
  handler: HandlerType;
  capability?: string;
  timestamp: number;
}
