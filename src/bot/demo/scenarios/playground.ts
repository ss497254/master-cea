import { BotInvokeRoute, BotMessageRoute } from "src/interfaces/bot/route";
import { sendActivity, sendCard } from "src/utils/helpers";
import { PLAYGROUND_CARD } from "../cards/playground";

export const PlaygroundRoute: BotMessageRoute = {
  keyword: "playground",
  description: "Sends the playground adaptive card",
  handler: async context => {
    await sendCard(context, PLAYGROUND_CARD);
  },
};

export const PlaygroundInvokeRoute: BotInvokeRoute = {
  name: "invoke",
  handler: async context => {
    console.log("Playground invoke payload:", context.activity.value);
    const payload = context.activity.value as any;

    if (payload.playground) {
      await sendActivity(context, {
        type: "invokeResponse",
        value: {
          status: 200,
          body: {},
        },
      });
    } else {
      return;
    }

    if (payload.type === "Markdown") {
      await sendActivity(context, {
        type: "message",
        text: `Received playground invoke with data: ${JSON.stringify(payload)}`,
      });
    } else if (payload.type === "AdaptiveCard") {
      await sendActivity(context, {
        type: "message",
        text: `Playground action received: ${payload.actionName}`,
      });
    }
  },
};
