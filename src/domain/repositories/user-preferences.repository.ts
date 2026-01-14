import { TurnContext, UserState } from "@microsoft/agents-hosting";
import { USER_MODE_STATE_KEY } from "src/infrastructure/config/constants";

/**
 * Interface for user preferences repository
 */
export abstract class IUserPreferencesRepository {
  abstract getMode(context: TurnContext): Promise<string | undefined>;
  abstract setMode(context: TurnContext, mode: string): Promise<void>;
  abstract clearMode(context: TurnContext): Promise<void>;
}

/**
 * Repository for managing user preferences using UserState.
 * Abstracts state management behind a clean interface.
 */
export class UserPreferencesRepository implements IUserPreferencesRepository {
  constructor(private userState: UserState) {}

  async getMode(context: TurnContext): Promise<string | undefined> {
    const accessor = this.userState.createProperty<string>(USER_MODE_STATE_KEY);
    return accessor.get(context);
  }

  async setMode(context: TurnContext, mode: string): Promise<void> {
    const accessor = this.userState.createProperty<string>(USER_MODE_STATE_KEY);
    await accessor.set(context, mode);
    await this.userState.saveChanges(context, false);
  }

  async clearMode(context: TurnContext): Promise<void> {
    const accessor = this.userState.createProperty<string | null>(USER_MODE_STATE_KEY);
    await accessor.set(context, null);
    await this.userState.saveChanges(context, false);
  }
}
