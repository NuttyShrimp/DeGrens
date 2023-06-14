import { Config } from '@dgx/server';
import { getStanceFromPossibilities, isSameStance } from '@shared/stances/helpers.stances';
import { getPlayerVehicleInfo, updateVehicleStance } from 'db/repository';
import { getVinForNetId } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { stanceLogger } from './logger.stances';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

const modelStanceConfig = new Map<number, Stances.Model>();

export const loadModelStanceConfig = async () => {
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue<Stances.Config>('vehicles.stances');

  modelStanceConfig.clear();
  for (const [modelName, modelConfig] of Object.entries(config)) {
    modelStanceConfig.set(GetHashKey(modelName) >>> 0, modelConfig);
  }
};

export const getStanceConfigForModel = (modelHash: number) => {
  return modelStanceConfig.get(modelHash >>> 0);
};

/**
 * Fully load vehicle stance. This includes checking overridestance, default stance and upgrade stancing
 */
export const loadStance = async (data: {
  vin: string;
  // use to skip getting vehicle from vin if you already have entity handle when calling this function
  vehicle?: number;
  // use to skip getting stance from db if you already have stance when calling this function
  overrideStance?: Stances.Stance;
  // if false we check if the vehicle has an override stance in db, we need this because we cant differentiate between no overridestance or not provided
  checkOverrideStance: boolean;
  // use to skip getting cosmetic upgrades from db if you already have them when calling this function
  upgrades?: Vehicles.Upgrades.Cosmetic.Upgrades;
  // use to reset vehicle stance back to original of model if no other stance was applicable for vehicle
  original?: Stances.Stance;
  // use to skip upgrades stance checks (for example in bennys)
  ignoreUpgrades?: boolean;
}) => {
  let vehicle = data.vehicle;
  if (vehicle) {
    vehicle = vinManager.getEntity(data.vin) ?? 0;
  }
  if (!vehicle || !DoesEntityExist(vehicle)) {
    stanceLogger.warn(`Failed to load stance: entity does not exist`);
    return;
  }

  const vehState = Entity(vehicle).state;
  const modelConfig = getStanceConfigForModel(GetEntityModel(vehicle));

  let overrideStance: Stances.Stance | undefined;
  if (data.overrideStance) {
    overrideStance = data.overrideStance;
  } else if (data.checkOverrideStance) {
    const vehicleInfo = await getPlayerVehicleInfo(data.vin);
    overrideStance = vehicleInfo?.stance ?? undefined;
  }

  // overrideStance takes prio
  if (overrideStance) {
    vehState.set('stance', overrideStance, true);
    return;
  }

  if (!data.ignoreUpgrades && modelConfig?.upgrade) {
    const upgrades = data.upgrades ?? (await upgradesManager.getCosmetic(data.vin));
    const upgradeValue = Number(upgrades[modelConfig.upgrade.component]);
    if (!isNaN(upgradeValue)) {
      const upgradeStance = getStanceFromPossibilities(modelConfig.upgrade.possibilities, upgradeValue);
      if (upgradeStance) {
        vehState.set('stance', upgradeStance, true);
        return;
      }
    }
  }

  if (modelConfig?.defaultStance) {
    vehState.set('stance', modelConfig.defaultStance, true);
    return;
  }

  if (data.original) {
    vehState.set('stance', data.original, true);
    setTimeout(() => {
      const currentStance = vehState.stance;
      if (!isSameStance(currentStance, data.original!)) return; // make sure stance hasnt been modified in meantime
      vehState.set('stance', null, true);
    }, 2000);
    return;
  }
};

export const saveStanceAsOverride = (netId: number, stance: Stances.Stance) => {
  const vin = getVinForNetId(netId);
  if (!vin || !vinManager.isVinFromPlayerVeh(vin)) return;

  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle) return;

  updateVehicleStance(vin, stance);
};

// we clear override stance if a new upgrade with associated modelstance is applied
export const handleStanceOnCosmeticChange = (
  vin: string,
  vehicle: number,
  changedUpgrades: Partial<Vehicles.Upgrades.Cosmetic.Upgrades>
) => {
  const modelConfig = getStanceConfigForModel(GetEntityModel(vehicle));
  if (!modelConfig?.upgrade) return;
  const upgradeValue = Number(changedUpgrades[modelConfig.upgrade.component]);
  if (isNaN(upgradeValue)) return;
  const upgradeStance = getStanceFromPossibilities(modelConfig.upgrade.possibilities, upgradeValue);
  if (!upgradeStance) return;
  updateVehicleStance(vin, null);
};
