import { Events, Notifications, Weapons } from '@dgx/server';
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
      let amount = parseInt(args.amount ?? '1');
      amount = Math.max(Math.min(amount, 250), 1);
      const plyId = args.Target?.serverId ?? caller.source;
      Weapons.forceSetAmmo(plyId, amount);
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
