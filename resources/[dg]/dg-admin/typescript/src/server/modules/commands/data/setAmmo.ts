import { Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface SetAmmoData {
  Target?: UI.Player;
  amount?: string;
}

export const setAmmo: CommandData = {
  name: 'setAmmo',
  log: 'has set ammo for someone',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, args: SetAmmoData) => {
    try {
      const amount = parseInt(args.amount ?? '0');
      if (amount < 1 || amount > 250) {
        Notifications.add(caller.source, 'Amount should be between 1 and 250', 'error');
        return;
      }
      const plyId = args.Target?.serverId ?? caller.source;
      TriggerClientEvent('weapons:client:ForceSetAmmo', plyId, amount);
    } catch (e) {
      console.error(e);
      Notifications.add(caller.source, 'Amount should be a number', 'error');
    }
  },
  UI: {
    title: 'Set Ammo',
    info: {
      inputs: [Inputs.Player],
      overrideFields: ['amount'],
    },
  },
};
