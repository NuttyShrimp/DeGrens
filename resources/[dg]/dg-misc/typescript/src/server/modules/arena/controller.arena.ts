import { Auth, Chat, Events, UI } from '@dgx/server';
import { dispatchInteriorToClients, getArenaTypes, setCurrentArenaType } from './service.arena';
import { typeToLabel } from './helpers.arena';

Auth.onAuth(plyId => {
  dispatchInteriorToClients(plyId);
});

Events.onNet('misc:arena:changeInterior', (plyId, arenaType: string | null) => {
  setCurrentArenaType(arenaType);
});

global.exports('openArenaInteriorTypeSelector', (plyId: number) => {
  const menuEntries: ContextMenu.Entry[] = [
    {
      title: 'Kies Arena Interieur',
      disabled: true,
      icon: 'list',
    },
    {
      title: 'Reset',
      callbackURL: 'arena/changeInterior',
      data: {
        arenaType: null,
      },
    },
  ];

  for (const arenaType of getArenaTypes()) {
    menuEntries.push({
      title: typeToLabel(arenaType),
      callbackURL: 'arena/changeInterior',
      data: {
        arenaType,
      },
    });
  }

  UI.openContextMenu(plyId, menuEntries);
});
