import { Events } from '@dgx/client';

const items: Set<string> = new Set();

Events.onNet('inventory:client:updateCache', (action: 'add' | 'remove', itemName: string) => {
  switch (action) {
    case 'add':
      items.add(itemName);
      break;
    case 'remove':
      items.delete(itemName);
      break;
  }
});

global.exports('getAllItemNames', () => [...items]);
