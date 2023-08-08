import { UI } from '@dgx/client';

onNet('inventory:addItemBox', (action: string, image: string, isLink = false) => {
  UI.SendAppEvent('itemboxes', { action, image, isLink });
});
