import { RPC } from '@dgx/server';
import bennysManager from './classes/BennysManager';
import { loadZones } from './modules/zones';
import { getBlockedUpgrades, loadBlockedUpgrades } from './helpers/blockedUpgrades';
import { getConfigByEntity } from 'modules/info/service.info';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

setImmediate(() => {
  loadZones();
  loadBlockedUpgrades();
});

on('playerDropped', () => {
  bennysManager.playerDropped(source);
});

RPC.register('vehicles:bennys:getPrices', (src, spotId: string) => {
  if (bennysManager.isNoChargeSpot(spotId)) {
    return upgradesManager.getPricesForClass({ free: true });
  }

  const spotData = bennysManager.getSpotData(spotId);
  const carClass = (spotData?.entity && getConfigByEntity(spotData.entity)?.class) || 'D';
  return upgradesManager.getPricesForClass({ carClass, includeTax: true });
});

RPC.register('vehicles:bennys:getBlockedUpgrades', (src, vehModel: number) => {
  return getBlockedUpgrades(String(vehModel));
});
