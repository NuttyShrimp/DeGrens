import { Auth, Events, RPC } from '@dgx/server';
import { getUpgradePrices } from 'modules/upgrades/service.upgrades';

import bennysManager from './classes/BennysManager';
import { getZones, loadZones } from './modules/zones';
import { getBlockedUpgrades, loadBlockedUpgrades } from './helpers/blockedUpgrades';

setImmediate(() => {
  loadZones();
  loadBlockedUpgrades();
});

on('playerDropped', () => {
  bennysManager.playerDropped(source);
});

RPC.register('vehicles:bennys:getPrices', (src, spotId: string) => {
  const spotData = bennysManager.getSpotData(spotId);
  if (!spotData) return;
  return getUpgradePrices(spotData.entity);
});

RPC.register('vehicles:bennys:getBlockedUpgrades', (src, vehModel: number) => {
  return getBlockedUpgrades(String(vehModel));
});
