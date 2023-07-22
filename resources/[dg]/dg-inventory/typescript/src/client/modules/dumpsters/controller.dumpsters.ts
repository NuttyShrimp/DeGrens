import { Peek, Util } from '@dgx/client';
import contextManager from 'classes/contextmanager';
import { DUMPSTER_MODELS } from './constants.dumpster';

Peek.addModelEntry(DUMPSTER_MODELS, {
  options: [
    {
      icon: 'fas fa-dumpster',
      label: 'Open',
      action: (_, entity) => {
        if (!entity) return;
        const coords = Util.getEntityCoords(entity);
        contextManager.openInventory({ type: 'dumpster', data: { coords } });
      },
    },
  ],
});
