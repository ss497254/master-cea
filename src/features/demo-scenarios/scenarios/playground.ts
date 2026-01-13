import { PLAYGROUND_CARD } from "src/features/demo-scenarios/cards/playground";
import { BotInvokeRoute, BotMessageRoute } from "src/shared/interfaces";
import { sendActivity, sendCard } from "src/utils/helpers";

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
        text: payload.input,
      });
    } else if (payload.type === "AdaptiveCard") {
      let card;
      try {
        card = JSON.parse(payload.input);
      } catch (error) {
        await sendActivity(context, {
          type: "message",
          text: `❌ Error parsing Adaptive Card JSON: ${(error as Error).message}`,
        });
      }

      try {
        await sendCard(context, card);
      } catch (error) {
        await sendActivity(context, {
          type: "message",
          text: `❌ Error sending Adaptive Card: ${(error as Error).message}`,
        });
      }
    } else if (payload.type === "Activity") {
      await context.sendActivity(`\
\`\`\`json
${JSON.stringify(context.activity, null, 2)}
\`\`\``);
    }
  },
};
