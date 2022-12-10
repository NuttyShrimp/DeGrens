import { Events } from '@dgx/client';

const items: string[] = [];

Events.onNet('inventory:client:updateCache', (action: 'add' | 'remove', itemName: string) => {
  switch (action) {
    case 'add':
      items.push(itemName);
      break;
    case 'remove':
      const idx = items.indexOf(itemName);
      items.splice(idx, 1);
      break;
  }
});

global.exports('getAllItemNames', () => items);
