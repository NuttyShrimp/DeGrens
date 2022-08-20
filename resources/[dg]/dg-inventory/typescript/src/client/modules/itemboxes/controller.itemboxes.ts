import { Events, UI } from '@dgx/client';

Events.onNet('inventory:client:addItemBox', (action: string, image: string) => {
  UI.SendAppEvent('itemboxes', { action, image });
});
