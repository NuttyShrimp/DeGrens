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
      return global.exports['dg-vehicles'].hasVehicleKeys(currentVehicle);
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
