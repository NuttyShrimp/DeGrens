import { Peek } from '@dgx/client';
import { DUMPSTER_MODELS } from './constants.dumpsters';
import { isSearched, searchDumpster } from './service.dumpsters';

Peek.addModelEntry(DUMPSTER_MODELS, {
  options: [
    {
      icon: 'fas fa-magnifying-glass',
      label: 'Doorzoek',
      action: (_, entity) => {
        if (!entity) return;
        searchDumpster(entity);
      },
      canInteract: entity => entity !== undefined && !isSearched(entity),
    },
  ],
  distance: 2.0,
});
