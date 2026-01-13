function taskModuleLink({
  appId,
  title = "",
  height = "medium",
  width = "medium",
  url = null,
  card = null,
  fallbackUrl,
  context,
}: {
  appId: string;
  title?: string;
  height?: string | number;
  width?: string | number;
  url?: string | null;
  card?: any;
  context?: any;
  fallbackUrl?: string;
}): string {
  if (url === null && card === null) {
    return "Error generating deep link: you must specify either a card or URL.";
  } else {
    let cardOrUrl = card === null ? `url=${url}` : `card=${JSON.stringify(card)}`;
    let fallBack = fallbackUrl === undefined ? "" : `&fallbackUrl=${fallbackUrl}`;
    let contextParam = context ? `&context=${encodeURIComponent(JSON.stringify(context))}` : "";
    return encodeURI(
      `https://teams.microsoft.com/l/task/${appId}?&height=${height}&width=${width}&title=${title}${cardOrUrl}${fallBack}${contextParam}`
    );
  }
}

export function getTaskModuleCard({ appId, botBaseUrl }: { appId: string; botBaseUrl: string }) {
  const contentUrl = botBaseUrl + "/assets/taskModule.html";
  const fallbackUrl = contentUrl + "?fallback=true";
  const tabInfo = {
    name: "Stage View",
    contentUrl,
    websiteUrl: fallbackUrl,
  };

  return {
    $schema: "https://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.5",
    fallbackText: "fallback text for sample 01",
    speak: "This is adaptive card sample 1",
    body: [
      {
        type: "TextBlock",
        size: "Medium",
        weight: "Bolder",
        text: " ",
      },
    ],
    actions: [
      {
        type: "Action.OpenUrl",
        title: "Stage OpenUrl",
        url: taskModuleLink({ appId, context: tabInfo }),
      },
      {
        type: "Action.OpenUrl",
        title: "Task OpenUrl",
        url: taskModuleLink({
          appId,
          title: "Task module",
          height: "400",
          width: "800",
          url: contentUrl,
          fallbackUrl,
        }),
      },
      {
        type: "Action.Submit",
        title: "Stage Submit",
        data: {
          msteams: {
            type: "invoke",
            value: {
              type: "tab/tabInfoAction",
              tabInfo: tabInfo,
            },
          },
        },
      },
      {
        type: "Action.Submit",
        title: "Stage View",
        data: {
          msteams: {
            type: "invoke",
            value: {
              type: "tab/tabInfoAction",
              tabInfo: tabInfo,
            },
          },
        },
      },
      {
        title: "Task Url",
        type: "Action.Submit",
        data: {
          msteams: {
            type: "invoke",
            value: {
              type: "task/fetch",
              taskType: "url",
            },
          },
        },
      },
      {
        title: "Task Card",
        type: "Action.Submit",
        data: {
          msteams: {
            type: "invoke",
            value: {
              type: "task/fetch",
              taskType: "adaptiveCard",
            },
          },
        },
      },
    ],
  };
}
