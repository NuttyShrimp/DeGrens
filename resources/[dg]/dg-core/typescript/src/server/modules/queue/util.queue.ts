export const generateQueueCard = (deferrals: Record<string, any>) => {
  return (msg: string) => {
    deferrals.presentCard(
      JSON.stringify({
        type: 'AdaptiveCard',
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        version: '1.4',
        body: [
          {
            type: 'Container',
            items: [
              {
                type: 'ColumnSet',
                columns: [
                  {
                    type: 'Column',
                    width: 50,
                    items: [
                      {
                        type: 'Image',
                        url: 'https://www.degrensrp.be/degrens_logo_trans.png',
                        altText: 'Background',
                        size: 'Large',
                      },
                      {
                        type: 'ColumnSet',
                        columns: [
                          {
                            type: 'Column',
                            width: 'stretch',
                            items: [
                              {
                                type: 'Image',
                                url: 'https://www.degrensrp.be/queue/discord-dg.png',
                                altText: 'Discord logo',
                                size: 'Small',
                                selectAction: {
                                  type: 'Action.OpenUrl',
                                  title: 'Discord',
                                  url: 'https://discord.degrensrp.be',
                                },
                              },
                            ],
                          },
                          {
                            type: 'Column',
                            width: 'stretch',
                            items: [
                              {
                                type: 'Image',
                                selectAction: {
                                  type: 'Action.OpenUrl',
                                  title: 'wiki',
                                  url: 'https://wiki.degrensrp.be',
                                },
                                url: 'https://www.degrensrp.be/queue/wiki-logo.png',
                                horizontalAlignment: 'Center',
                                size: 'Small',
                              },
                            ],
                          },
                        ],
                        horizontalAlignment: 'Center',
                      },
                    ],
                    horizontalAlignment: 'Center',
                    verticalContentAlignment: 'Center',
                    spacing: 'None',
                  },
                  {
                    type: 'Column',
                    width: 50,
                    horizontalAlignment: 'Center',
                    items: [
                      {
                        type: 'TextBlock',
                        text: msg,
                        wrap: true,
                        weight: 'Bolder',
                        size: 'Large',
                        color: 'Light',
                      },
                      {
                        type: 'Image',
                        url: 'https://www.degrensrp.be/queue/bar.gif',
                        spacing: 'None',
                        horizontalAlignment: 'Center',
                      },
                      {
                        type: 'TextBlock',
                        text: 'Need help? Join our discord where you can ask for support in the inteded channels!',
                        wrap: true,
                        color: 'Light',
                        spacing: "ExtraLarge"
                      },
                    ],
                    verticalContentAlignment: 'Center',
                  },
                ],
                spacing: 'None',
                horizontalAlignment: 'Center',
              },
            ],
            minHeight: '200px',
            horizontalAlignment: 'Center',
            verticalContentAlignment: 'Center',
            spacing: 'None',
          },
        ],
        backgroundImage: {
          url: 'https://www.degrensrp.be/queue/background-darker.png',
          verticalAlignment: 'Center',
          horizontalAlignment: 'Center',
        },
      })
    );
  };
};
