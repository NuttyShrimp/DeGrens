import { Events, Notifications, Weapons } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface SetAmmoData {
  Target?: UI.Player;
  quality?: string;
}

export const setWeaponQuality: CommandData = {
  name: 'setWeaponQuality',
  log: 'has set quality of weapon for someone',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, args: SetAmmoData) => {
    try {
      const quality = parseInt(args.quality ?? '0');
      if (quality < 0 || quality > 100) {
        Notifications.add(caller.source, 'Quality should be between 0 and 100', 'error');
        return;
      }
      const plyId = args.Target?.serverId ?? caller.source;
      Weapons.forceSetQuality(plyId, quality);
    } catch (e) {
      console.error(e);
      Notifications.add(caller.source, 'Quality should be a number', 'error');
    }
  },
  UI: {
    title: 'Set Weapon Quality',
    info: {
      inputs: [Inputs.Player],
      overrideFields: ['quality'],
    },
  },
};
