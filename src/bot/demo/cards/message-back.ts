export const messageBackCard = {
  type: "AdaptiveCard",
  body: [
    {
      type: "Container",
      items: [
        {
          type: "ColumnSet",
          columns: [
            {
              type: "Column",
              width: "stretch",
              items: [
                {
                  type: "ActionSet",
                  actions: [
                    {
                      type: "Action.Submit",
                      title: "messageBack-value-mockStream",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "mockStream MessageBack button",
                          displayText: "I clicked this messasgeBack button",
                          text: "mockStream",
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-value-xml",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "xml MessageBack button",
                          displayText: "I clicked this messasgeBack button",
                          text: "xml",
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-value-stringjson",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked this button",
                          text: "User just clicked the MessageBack button",
                          value: '{"property": "propertyValue" }',
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-value-json",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked this button",
                          text: "User just clicked the MessageBack button",
                          value: {
                            property: "propertyValue",
                          },
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-value-string",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked this button",
                          text: "User just clicked the MessageBack button",
                          value: "property",
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-value-null",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked this button",
                          text: "User just clicked the MessageBack button",
                          value: null,
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-value-notfound",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked this button",
                          text: "User just clicked the MessageBack button",
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-value-string-and-extra",
                      data: {
                        field1: "value1",
                        field2: "value2",
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked this button",
                          text: "User just clicked the MessageBack button",
                          value: "some string",
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-text-null",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked this button",
                          text: null,
                          value: '{"property": "propertyValue" }',
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-text-empty",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked this button",
                          text: "",
                          value: '{"property": "propertyValue" }',
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-text-notfound",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked this button",
                          value: '{"property": "propertyValue" }',
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-displayText-null",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: null,
                          text: "User just clicked the MessageBack button",
                          value: '{"property": "propertyValue" }',
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-displayText-empty",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "",
                          text: "User just clicked the MessageBack button",
                          value: '{"property": "propertyValue" }',
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-text-value-null",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          displayText: "I clicked the button",
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-text-value-displayText-null",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "messageBack-displayText-notfound",
                      data: {
                        msteams: {
                          type: "messageBack",
                          title: "My MessageBack button",
                          text: "User just clicked the MessageBack button",
                          value: '{"property": "propertyValue" }',
                        },
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "imBack",
                      data: {
                        msteams: {
                          type: "imBack",
                          title: "show me everything title",
                          value: "show me everything",
                        },
                      },
                    },
                  ],
                  spacing: "Medium",
                },
              ],
            },
          ],
          spacing: "Medium",
        },
      ],
      spacing: "ExtraLarge",
      horizontalAlignment: "Center",
      height: "stretch",
      verticalContentAlignment: "Center",
    },
  ],
  $schema: "https://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
};
