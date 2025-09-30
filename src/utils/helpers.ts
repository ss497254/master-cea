import { Activity, ActivityTypes } from '@microsoft/agents-activity';

export function getMessageTextFromActivity(activity: Activity): string | undefined {
  if (Activity.fromObject(activity).type === ActivityTypes.Message) {
    return activity.text;
  }
}
