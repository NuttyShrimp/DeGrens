import { Notifications } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

interface CarboostCancelData {
  Target?: UI.Player;
}

export const carboostCancel: CommandData = {
  name: 'carboostCancel',
  role: 'staff',
  log: 'has canceled a carboost',
  target: false,
  isClientCommand: false,
  handler: (caller, args: CarboostCancelData) => {
    if (!args.Target?.cid) {
      Notifications.add(caller.source, 'Je moet een target meegeven', 'error');
      return;
    }

    global.exports['dg-carboosting'].adminCancelBoost(args.Target.cid);
    Notifications.add(caller.source, `Player ${args.Target.cid} active boost has been canceled`, 'success');
  },
  UI: {
    title: 'Carboost - Cancel Boost',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
