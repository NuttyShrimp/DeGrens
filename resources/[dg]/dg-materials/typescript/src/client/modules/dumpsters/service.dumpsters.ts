import { RPC, Taskbar, Util, Events, Notifications } from '@dgx/client';

const searchedDumpsters = new Set<number>();

export const searchDumpster = async (entity: number) => {
  if (isSearched(entity)) return;

  const position = Util.getEntityCoords(entity);

  const canSearch = await RPC.execute<boolean>('materials:dumpsters:startSearch', position);
  if (!canSearch) {
    Notifications.add('Niks gevonden...', 'error');
    return;
  }
  searchedDumpsters.add(entity);

  const [canceled] = await Taskbar.create('magnifying-glass', 'Doorzoeken', 15000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'missexile3',
      anim: 'ex03_dingy_search_case_base_michael',
      flags: 17,
    },
  });
  if (canceled) {
    Notifications.add('Niks gevonden...', 'error');
    return;
  }

  Events.emitNet('materials:dumpsters:finishSearch', position);
};

export const isSearched = (entity: number) => searchedDumpsters.has(entity);
