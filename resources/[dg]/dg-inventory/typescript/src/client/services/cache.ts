// Only use to do first check in things like peek, radialmenu where you dont want to call server every time
// Make sure to use proper server check when doing action

const items: string[] = [];

onNet('inventory:updateCache', (action: 'add' | 'remove', itemName: string) => {
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

global.exports('getCachedItemNames', () => items);
