import { BlipManager, Events, UI } from '@dgx/client';
import { loadBusinesses } from 'service/businesses';
import { startPricedItemOrder } from 'service/itemorder';
import { setBusinessPermsCache, updateBusinessPermsCache } from 'service/permscache';
import { addSignedInBusiness, removeSignedInBusiness } from 'service/signin';

Events.onNet('business:client:setPermLabels', (labels: Record<string, string>) => {
  UI.SendAppEvent('phone', {
    appName: 'business',
    action: 'setBusinessPermissionLabels',
    data: labels,
  });
});

Events.onNet('business:client:loadBusinesses', loadBusinesses);

Events.onNet('business:client:addSignedIn', addSignedInBusiness);
Events.onNet('business:client:removeSignedIn', removeSignedInBusiness);

on('onResourceStop', (resourceName: string) => {
  if (resourceName != GetCurrentResourceName()) return;

  BlipManager.removeCategory('business');
});

Events.onNet('business:client:setCache', setBusinessPermsCache);
Events.onNet('business:client:updateCache', updateBusinessPermsCache);

Events.onNet('business:client:startPricedItemOrder', startPricedItemOrder);
