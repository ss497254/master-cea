/**
 * Configuration for MCP server connections (future use)
 */
export interface IMCPServerConfig {
  /** Server identifier */
  id: string;
  /** Server name for display */
  name: string;
  /** Transport type */
  transport: "stdio" | "sse" | "websocket";
  /** Command to start server (for stdio transport) */
  command?: string;
  /** Arguments for the command */
  args?: string[];
  /** URL for remote servers (sse/websocket) */
  url?: string;
  /** Connection timeout in ms */
  timeout?: number;
  /** Whether server is enabled */
  enabled: boolean;
}

/**
 * MCP client configuration
 */
export interface IMCPConfig {
  /** Enable MCP integration */
  enabled: boolean;
  /** Server configurations */
  servers: IMCPServerConfig[];
  /** Global timeout for MCP operations (ms) */
  globalTimeout?: number;
}

/**
 * MCP tool representation
 */
export interface IMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  serverId: string;
}
