// These entries are visible when player is down
export const down: RadialMenu.Entry[] = [
  {
    title: 'Noodknop',
    icon: 'light-emergency',
    type: 'client',
    event: 'police:emergencyButton',
    shouldClose: true,
    jobs: ['police'],
  },
];
