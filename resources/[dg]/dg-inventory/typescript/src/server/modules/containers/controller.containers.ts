import { Events } from '@dgx/server';
import itemManager from 'modules/items/manager.items';

Events.onNet('inventory:containers:label', (plyId, containerId: string, label: string) => {
  const containerItem = itemManager.get(containerId);
  if (!containerItem) return;
  containerItem.setMetadata(() => ({ label }));
});
