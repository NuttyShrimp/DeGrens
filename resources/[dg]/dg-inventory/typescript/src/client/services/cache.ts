import { Events } from '@dgx/client';

const items: string[] = [];

Events.onNet('inventory:client:updateCache', (action: 'add' | 'remove', itemName: string) => {
  switch (action) {
    case 'add':
      items.push(itemName);
      break;
    case 'remove':
      const idx = items.indexOf(itemName);
      if (idx !== -1) {
        items[idx] = items[items.length - 1];
        items.pop();
      }
      break;
  }
});

global.exports('getAllItemNames', () => items);
