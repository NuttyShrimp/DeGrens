import { Util } from '@dgx/server';
import { updateVehicleCosmeticUpgrades } from 'db/repository';
import vinManager from 'modules/identification/classes/vinmanager';
import upgradesManager from './classes/manager.upgrades';

export const saveCosmeticUpgrades = async (vin: string, newUpgrades: Partial<Vehicles.Upgrades.Cosmetic.Upgrades>) => {
  if (!vinManager.isVinFromPlayerVeh(vin)) return;
  const currentUpgrades = await upgradesManager.getCosmetic(vin);
  if (!currentUpgrades) return;
  await updateVehicleCosmeticUpgrades(vin, { ...currentUpgrades, ...newUpgrades });
  Util.Log(
    'vehicles:upgrades:cosmetic',
    {
      vin: vin,
      newUpgrades,
    },
    `Upgrades for vehicle (${vin}) have been updated`
  );
};
