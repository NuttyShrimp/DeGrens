import { Auth, Events, RPC } from '@dgx/server';
import { getUpgradePrices } from 'modules/upgrades/service.upgrades';

import bennysManager from './classes/BennysManager';
import { getZones, loadZones } from './service.bennys';

setImmediate(() => {
  loadZones();
});

Auth.onAuth(src => {
  Events.emitNet('vehicles:bennys:load', src, getZones());
});

on('playerDropped', () => {
  bennysManager.playerDropped(source);
});

RPC.register('vehicles:bennys:getPrices', (src, spotId: string) => {
  const spotData = bennysManager.getSpotData(spotId);
  if (!spotData) return;
  return getUpgradePrices(spotData.entity);
});
