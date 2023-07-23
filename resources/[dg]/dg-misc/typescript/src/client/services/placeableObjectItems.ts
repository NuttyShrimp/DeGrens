import { Peek, Events } from '@dgx/client';

Peek.addFlagEntry('placeableObjectItem', {
  options: [
    {
      label: 'Oppakken',
      icon: 'fas fa-hand',
      action: (_, ent) => {
        if (!ent || !DoesEntityExist(ent)) return;
        const entState = Entity(ent).state;
        const objId: string | undefined = entState?.objId;
        const itemName: string | undefined = entState?.placeableObjectItem;
        if (!objId || !itemName) return;
        Events.emitNet('misc:placeableObjectItems:pickup', objId, itemName);
      },
    },
  ],
});
