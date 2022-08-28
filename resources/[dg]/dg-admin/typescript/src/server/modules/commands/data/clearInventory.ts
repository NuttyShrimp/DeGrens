import { Inventory } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

declare interface ClearInventoryProps {
  Target?: UI.Player;
}

export const clearInventory: CommandData = {
  name: 'clearInventory',
  role: 'staff',
  log: 'has cleared a players inventory',
  isClientCommand: false,
  target: [],
  handler: (caller, args: ClearInventoryProps) => {
    Inventory.clearPlayerInventory(args.Target?.serverId ?? caller.source);
  },
  UI: {
    title: 'Clear Player Inventory',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
