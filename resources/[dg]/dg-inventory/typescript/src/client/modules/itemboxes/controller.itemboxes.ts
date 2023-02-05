import { UI } from '@dgx/client';

onNet('inventory:addItemBox', (action: string, image: string) => {
  UI.SendAppEvent('itemboxes', { action, image });
});
