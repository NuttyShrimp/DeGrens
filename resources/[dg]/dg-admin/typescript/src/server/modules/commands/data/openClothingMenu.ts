import { Events } from '@dgx/server';
import { SelectorTarget } from 'enums/SelectorTargets';
import { Inputs } from 'enums/inputs';

declare interface ClothingMenuData {
  Target?: UI.Player;
  entity?: number;
}

export const openClothingMenu: CommandData = {
  name: 'openClothingMenu',
  log: 'opened the clothing menu for someone',
  isClientCommand: false,
  target: [SelectorTarget.PLAYER],
  role: 'staff',
  handler: (caller, data: ClothingMenuData) => {
    let plyId = caller.source;
    if (data?.entity) {
      plyId = NetworkGetEntityOwner(data.entity);
    } else if (data?.Target) {
      plyId = data.Target.serverId;
    }

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
