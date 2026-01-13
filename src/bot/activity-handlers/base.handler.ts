import { ActivityHandler, TurnContext } from "@microsoft/agents-hosting";
import { ILogger } from "src/shared/interfaces";

/**
 * Base activity handler with common functionality for member greeting and logging.
 * Extend this class to create handlers with consistent welcome behavior.
 */
export abstract class BaseActivityHandler extends ActivityHandler {
  constructor(
    protected readonly handlerName: string,
    protected readonly logger: ILogger
  ) {
    super();
    this.setupMembersAddedHandler();
    this.setupMessageHandler();
  }

  /**
   * Get the welcome message for new members.
   * Override this method to customize the welcome message.
   */
  protected getWelcomeMessage(): string {
    return `Welcome to the ${this.handlerName} bot!`;
  }

  /**
   * Process an incoming message.
   * Override this method to implement custom message handling.
   */
  protected abstract processMessage(context: TurnContext): Promise<void>;

  private setupMembersAddedHandler(): void {
    this.onMembersAdded(async (context, next) => {
      this.logger.debug("Members added", { members: context.activity.membersAdded });
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded!) {
        if (member.id !== context.activity.recipient!.id) {
          await context.sendActivity(this.getWelcomeMessage());
        }
      }
      await next();
    });
  }

  private setupMessageHandler(): void {
    this.onMessage(async (context, next) => {
      await this.processMessage(context);
      await next();
    });
  }
}
