export function getHelpCard(routes: string[]) {
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
    actions: routes.map(route => ({
      type: 'Action.Submit',
      title: route,
      data: {
        msteams: {
          type: 'Imback',
          title: route,
          value: route,
        },
      },
    })),
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
  };
}
