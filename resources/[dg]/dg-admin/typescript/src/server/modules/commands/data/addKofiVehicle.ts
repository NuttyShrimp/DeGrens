import { Notifications } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

interface AddKofiVehicleData {
  Target?: UI.Player;
  VehicleModel?: UI.VehicleModel;
}

export const addKofiVehicle: CommandData = {
  name: 'addKofiVehicle',
  role: 'developer',
  log: 'added a kofi vehicle for player',
  target: false,
  isClientCommand: false,
  handler: (caller, args: AddKofiVehicleData) => {
    const targetCID = args.Target?.cid ?? caller.cid;
    const model = args.VehicleModel?.model;
    if (!model || !targetCID) {
      Notifications.add(caller.source, 'Geen model of target cid');
      return;
    }

    global.exports['dg-vehicles'].addVehicleToKofiShopForCID(caller.source, targetCID, model);
  },
  UI: {
    title: 'Add Kofi Vehicle',
    info: {
      inputs: [Inputs.Player, Inputs.VehicleModel],
    },
  },
};
