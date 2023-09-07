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
  {
    title: 'Deel Sleutels',
    icon: 'key',
    type: 'client',
    event: 'vehicles:keys:share',
    shouldClose: true,
    isEnabled: ({ currentVehicle }) => {
      if (!currentVehicle) return false;
      return global.exports['dg-vehicles'].hasVehicleKeys(currentVehicle);
    },
  },
];
