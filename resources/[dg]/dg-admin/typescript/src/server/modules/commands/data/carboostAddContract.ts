import { Notifications } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

interface CarboostAddContractData {
  Target?: UI.Player;
  VehicleModel?: UI.VehicleModel;
}

export const carboostAddContract: CommandData = {
  name: 'carboostAddContract',
  role: 'developer',
  log: 'added carboost contract to player',
  target: false,
  isClientCommand: false,
  handler: (caller, args: CarboostAddContractData) => {
    const targetCID = args.Target?.cid ?? caller.cid;
    const model = args.VehicleModel?.model;
    if (!model || !targetCID) {
      Notifications.add(caller.source, 'Geen model of target meegegeven');
      return;
    }

    global.exports['dg-carboosting'].createContract(model, +targetCID);
    Notifications.add(caller.source, `Successfully added carboost contract for ${model} to ${targetCID}`);
  },
  UI: {
    title: 'Carboost - Add Contract',
    info: {
      inputs: [Inputs.Player, Inputs.VehicleModel],
    },
  },
};
