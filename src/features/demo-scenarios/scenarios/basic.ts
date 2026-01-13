import { messageBackCard } from "src/features/demo-scenarios/cards/message-back";
import { BotMessageRoute } from "src/shared/interfaces";
import { sendActivity, sendCard } from "src/utils/helpers";

export const HelloWorldRoutes: BotMessageRoute = {
  keyword: "hello",
  description: "Responds with a greeting message",
  handler: async context => {
    await context.sendActivity("Hello! How can I assist you today?");
  },
};

export const TextRoute: BotMessageRoute = {
  keyword: "text",
  description: "Sends a simple text message",
  handler: async context => {
    await context.sendActivity("This is only with full stop. See if its working");
  },
};

export const MediaRoute: BotMessageRoute = {
  keyword: "media",
  description: "Sends a media message with an image attachment",
  handler: async context => {
    const reply = {
      type: "message",
      text: "This is a media message",
      attachments: [
        {
          contentType: "image/jpg",
          contentUrl: "https://www.publicdomainpictures.net/pictures/30000/t2/duck-on-a-rock.jpg",
          name: "duck-on-a-rock.jpg",
        },
      ],
    };
    await sendActivity(context, reply);
  },
};

export const MessageBackRoute: BotMessageRoute = {
  keyword: /messageback|message-back/,
  description: "Sends a adaptive card with a MessageBack buttons",
  handler: async context => {
    await sendCard(context, messageBackCard);
  },
};

export const TaskModuleRoute: BotMessageRoute = {
  keyword: /taskmodule|task-module/,
  description: "Sends a task module adaptive card",
  handler: async context => {
    const botBaseUrl = process.env.BOT_BASE_URL || "https://your-bot-base-url.com";
    const appId = process.env.MICROSOFT_APP_ID || "your-app-id";

    const { getTaskModuleCard } = await import("../cards/task-module");
    const taskModuleCard = getTaskModuleCard({ appId, botBaseUrl });

    await sendCard(context, taskModuleCard);
  },
};

export const ErrorRoute: BotMessageRoute = {
  keyword: "error",
  description: "Simulates a route that throws an error",
  handler: async () => {
    throw new Error("This is a test error");
  },
};
