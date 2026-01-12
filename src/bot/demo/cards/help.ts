type HelpAction = {
  title: string;
  value: string;
};

export function getHelpCard(routes: HelpAction[]) {
  return {
    type: 'AdaptiveCard',
    body: [
      {
        type: 'TextBlock',
        size: 'Large',
        weight: 'Bolder',
        text: 'Hi, welcome to the Master CEA!',
      },
      {
        type: 'TextBlock',
        size: 'Medium',
        weight: 'Bolder',
        wrap: true,
        text: 'I support following messages, feel free to click and explore functionality',
      },
    ],
    actions: routes.map(({ title, value }) => ({
      type: 'Action.Submit',
      title,
      data: {
        msteams: {
          type: 'Imback',
          title,
          value,
        },
      },
    })),
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
  };
}
