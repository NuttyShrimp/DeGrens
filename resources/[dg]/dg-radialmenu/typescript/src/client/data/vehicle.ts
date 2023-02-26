export const vehicle: RadialMenu.Entry[] = [
  {
    title: 'Motor',
    icon: 'engine',
    type: 'client',
    event: 'vehicles:radial:engine',
    shouldClose: true,
    isEnabled: ({ currentVehicle }) => {
      if (!currentVehicle) return false;
      if (GetPedInVehicleSeat(currentVehicle, -1) !== PlayerPedId()) return false;
      if (GetIsVehicleEngineRunning(currentVehicle)) return true; // if engine on, can always turn off
      return global.exports['dg-vehicles'].hasVehicleKeys(currentVehicle); // can only turn on when you have keys
    },
  },
  {
    title: 'Deuren',
    icon: 'car-side',
    subMenu: 'vehicleDoors',
  },
  {
    title: 'Stoelen',
    icon: 'chair',
    subMenu: 'vehicleSeats',
  },
];
