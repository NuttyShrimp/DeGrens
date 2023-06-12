import { Inventory } from '@dgx/server';
import vinManager from 'modules/identification/classes/vinmanager';
import { TUNE_PARTS } from '../../../shared/upgrades/constants.upgrades';
import upgradesManager from './classes/manager.upgrades';

// export to set alloweditems in tunes inventories
global.exports('getTuneItemNames', (): string[] => {
  return Object.values(TUNE_PARTS).map(x => x.itemName);
});

// this handler gets spammed when inventory gets loaded.
// However when a tunes inv gets loaded, the associated vin will not have an entity linked to it yet so it will not spam upgrade apply events
Inventory.onInventoryUpdate('tunes', async (vin: string) => {
  const vehicle = vinManager.getEntity(vin);
  if (!vehicle) return;

  const performanceUpgrades = await upgradesManager.getPerformance(vin);
  if (!performanceUpgrades) return;

  upgradesManager.apply(vehicle, performanceUpgrades);
});
