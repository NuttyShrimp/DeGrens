declare interface LocateVehicleData {
  vin?: string;
}

export const locateVehicle: CommandData = {
  name: 'locateVehicle',
  role: 'staff',
  log: 'has located a vehicle',
  isClientCommand: false,
  target: false,
  handler: (caller, args: LocateVehicleData) => {
    const vin = args?.vin;
    if (!vin || vin === '') return;
    global.exports['dg-vehicles'].locateVehicleFromAdminMenu(caller.source, vin);
  },
  UI: {
    title: 'Locate Vehicle',
    info: {
      overrideFields: ['vin'],
    },
  },
};
