import { Events, Inventory, Notifications, Util } from '@dgx/server';
import { Inputs } from 'enums/inputs';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface OpenInventoryData {
  Target?: UI.Player;
  entity?: number;
  inventoryId?: string;
}

export const openInventory: CommandData = {
  name: 'openInventory',
  role: 'staff',
  target: [SelectorTarget.PLAYER],
  isClientCommand: false,
  log: 'opened an inventory',
  handler: (caller, args: OpenInventoryData) => {
    let inv: string;
    if (args.inventoryId) {
      const invData = Inventory.splitId(args.inventoryId);
      if (!invData.type || !invData.identifier) {
        Notifications.add(caller.source, 'Meegegeven id is geen inventory id');
        return;
      }
      inv = args.inventoryId;
    } else {
      const targetPlayer = args.entity ? NetworkGetEntityOwner(args.entity) : args.Target?.serverId;
      if (!targetPlayer) {
        Notifications.add(caller.source, 'Je moet een target invullen', 'error');
        return;
      }
      inv = Inventory.concatId('player', Util.getCID(targetPlayer));
    }
    Events.emitNet('inventory:client:openOverride', caller.source, inv);
    Events.emitNet('admin:menu:forceClose', caller.source);
  },
  UI: {
    title: 'Open Inventory',
    info: {
      inputs: [Inputs.Player],
      overrideFields: ['inventoryId'],
    },
  },
};
