export const PLAYGROUND_CARD = {
  type: "AdaptiveCard",
  body: [
    {
      text: "This is a playground card. You can enter any payload and view how it is rendered.",
      type: "TextBlock",
    },
    {
      choices: [
        {
          title: "Markdown - Rendered as markdown text",
          value: "Markdown",
        },
        {
          title: "Adaptive Card - Rendered as an adaptive card",
          value: "Adaptive Card",
        },
        {
          title: "Activity - Rendered as a full activity",
          value: "Activity",
        },
      ],
      value: "Markdown",
      placeholder: "Select payload type, default Markdown",
      id: "type",
      type: "Input.ChoiceSet",
      label: "Type",
    },
    {
      placeholder: "Placeholder text",
      isRequired: true,
      label: "Enter payload below",
      id: "playgroundPayload",
      spacing: "ExtraSmall",
      type: "Input.Text",
      height: "stretch",
      maxLength: 1000,
      isMultiline: true,
    },
    {
      actions: [
        {
          data: {
            msteams: {
              type: "invoke",
              value: {
                playground: true,
              },
            },
          },
          title: "View",
          type: "Action.Submit",
        },
      ],
      type: "ActionSet",
    },
  ],
  $schema: "https://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
};
