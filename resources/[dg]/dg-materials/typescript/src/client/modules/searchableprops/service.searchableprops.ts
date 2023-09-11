import { RPC, Taskbar, Util, Events, Notifications, Peek } from '@dgx/client';

const searchedProps = new Set<number>();

export const loadSearchablePropsInitData = (initData: Materials.SearchableProps.InitData) => {
  for (const [propType, models] of Object.entries(initData.models)) {
    Peek.addModelEntry(models, {
      options: [
        {
          icon: 'fas fa-magnifying-glass',
          label: 'Doorzoek',
          action: (_, entity) => {
            if (!entity) return;
            startSearchingProp(propType, entity);
          },
          canInteract: entity => entity !== undefined && !isSearched(entity),
        },
      ],
      distance: 2.0,
    });
  }
};

const startSearchingProp = async (propType: string, entity: number) => {
  if (isSearched(entity)) return;

  const position = Util.getEntityCoords(entity);

  const canSearch = await RPC.execute<boolean>('materials:searchableprops:start', propType, position);
  if (!canSearch) {
    Notifications.add('Dit is al doorzocht', 'error');
    return;
  }

  searchedProps.add(entity);

  const [canceled] = await Taskbar.create('magnifying-glass', 'Doorzoeken', 10000, {
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

  Events.emitNet('materials:searchableprops:finish', propType, position);
};

export const isSearched = (entity: number) => searchedProps.has(entity);
