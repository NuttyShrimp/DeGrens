import { Peek } from '@dgx/client';

import { TROLLEY_OBJECTS } from './constants.trolleys';
import { lootTrolley } from './helpers.trolley';

Peek.addModelEntry(
  Object.values(TROLLEY_OBJECTS).map(data => data.trolley),
  {
    options: [
      {
        icon: 'fas fa-sack',
        label: 'Nemen',
        action: (_, entity) => {
          if (!entity) return;
          Entity(entity).state.set('canBeLooted', false, true);
          lootTrolley(entity);
        },
        canInteract: entity => {
          if (!entity) return;
          return Entity(entity).state['canBeLooted'];
        },
      },
    ],
    distance: 1.5,
  }
);
