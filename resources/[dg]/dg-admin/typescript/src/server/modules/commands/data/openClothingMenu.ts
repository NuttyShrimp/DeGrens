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
    emitNet('qb-clothing:client:openMenu', data?.Target.serverId ?? caller.source);
  },
  UI: {
    title: 'Give Clothing Menu',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
