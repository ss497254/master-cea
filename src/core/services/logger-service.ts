import { ILogger } from "../../interfaces/services/logger";

export class LoggerService implements ILogger {
  private logLevel: string;
  private enableConsole: boolean;

  constructor(logLevel: string = "info", enableConsole: boolean = true) {
    this.logLevel = logLevel;
    this.enableConsole = enableConsole;
  }

  private shouldLog(level: string): boolean {
    const levels = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  private log(level: string, message: string, error?: Error, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level) || !this.enableConsole) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);

    switch (level) {
      case "debug":
        console.debug(formattedMessage);
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "error":
        console.error(formattedMessage);
        if (error) {
          console.error("Error details:", error);
        }
        break;
    }
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.log("debug", message, undefined, meta);
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.log("info", message, undefined, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.log("warn", message, undefined, meta);
  }

  public error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.log("error", message, error, meta);
  }
}
