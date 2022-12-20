import { Events } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface ClothingMenuData {
  Target?: UI.Player;
}

export const openClothingMenu: CommandData = {
  name: 'openClothingMenu',
  log: 'opened the clothing menu for someone',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, data: ClothingMenuData) => {
    const plyId = data?.Target?.serverId ?? caller.source;
    emitNet('qb-clothing:client:openMenu', plyId);

    if (plyId === caller.source) {
      Events.emitNet('admin:menu:forceClose', caller.source);
    }
  },
  UI: {
    title: 'Give Clothing Menu',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
