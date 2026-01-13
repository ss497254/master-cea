import { Activity, ActivityTypes } from "@microsoft/agents-activity";
import { TurnContext } from "@microsoft/agents-hosting";

export function getMessageTextFromActivity(activity: Activity): string | undefined {
  if (Activity.fromObject(activity).type === ActivityTypes.Message) {
    return activity.text;
  }
}

export function sendCard(context: TurnContext, card: object) {
  return sendActivity(context, {
    type: ActivityTypes.Message,
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: card,
      },
    ],
  });
}

export function sendActivity(context: TurnContext, activity: object) {
  return context.sendActivity(Activity.fromObject(activity));
}

export function isMessageActivityForRoute(activity: Activity, keyword: string | RegExp): boolean {
  const messageText = getMessageTextFromActivity(activity) || "";

  if (typeof keyword === "string") {
    return messageText.toLowerCase().includes(keyword.toLowerCase());
  } else if (keyword instanceof RegExp) {
    return keyword.test(messageText);
  }

  return false;
}

export function isInvokeActivityForRoute(activity: Activity, name: string): boolean {
  const { name: activityName } = Activity.fromObject(activity);
  return activityName ? activityName === name : true;
}
