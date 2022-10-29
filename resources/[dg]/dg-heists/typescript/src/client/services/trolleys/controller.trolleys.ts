import { Peek } from '@dgx/client';
import { TROLLEY_OBJECTS } from './constants.trolleys';
import { lootTrolley } from './helpers.trolley';

Object.entries(TROLLEY_OBJECTS).forEach(([_, data]) => {
  Peek.addModelEntry(
    data.trolley,
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
            return Entity(entity).state['canBeLooted'];
          },
        },
      ],
      distance: 1.5,
    },
    true
  );
});
