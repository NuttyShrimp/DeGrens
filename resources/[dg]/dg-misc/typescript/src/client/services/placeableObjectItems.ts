import { Peek, Events } from '@dgx/client';

Peek.addFlagEntry('placeableObjectItemId', {
  options: [
    {
      label: 'Oppakken',
      icon: 'fas fa-hand',
      action: (_, ent) => {
        if (!ent || !DoesEntityExist(ent)) return;
        const entState = Entity(ent).state;
        const objId: string | undefined = entState?.objId;
        const itemId: string | undefined = entState?.placeableObjectItemId;
        if (!objId || !itemId) return;
        Events.emitNet('misc:placeableObjectItems:pickup', objId, itemId);
      },
    },
  ],
});
