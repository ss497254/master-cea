import { ActivityTypes } from "@microsoft/agents-activity";
import { BotMessageRoute } from "src/interfaces/bot/route";
import { sendActivity } from "src/utils/helpers";

export const SensitivityRoute: BotMessageRoute = {
  keyword: "sensitivity",
  description: "Sends a message with sensitivity labels and AI-generated content",
  handler: async context => {
    const activity = {
      type: ActivityTypes.Message,
      text: `Hey I'm a friendly AI bot. This message is generated via AI [1]`,
      channelData: {
        feedbackLoopEnabled: true,
      },
      entities: [
        {
          type: "https://schema.org/Message",
          "@type": "Message",
          "@context": "https://schema.org",
          usageInfo: {
            "@type": "CreativeWork",
            "@id": "sensitivity1",
            name: "Sensitivity title main",
            description: "Sensitivity description main",
          },
          additionalType: ["AIGeneratedContent"],
          citation: [
            {
              "@type": "Claim",
              position: 1,
              appearance: {
                "@type": "DigitalDocument",
                name: "Some secret citation",
                url: "https://example.com/claim-1",
                abstract: "Excerpt",
                encodingFormat: "docx",
                keywords: ["Keyword1 - 1", "Keyword1 - 2", "Keyword1 - 3"], // These appear below the citation title
                usageInfo: {
                  "@type": "CreativeWork",
                  "@id": "sensitivity1",
                  name: "Sensitivity title citation",
                  description: "Sensitivity description citation",
                },
              },
            },
          ],
        },
      ],
    };

    await sendActivity(context, activity);
  },
};
