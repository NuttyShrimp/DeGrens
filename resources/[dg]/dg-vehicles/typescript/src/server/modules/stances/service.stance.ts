import { Util, Config } from '@dgx/server';
import { updateVehicleStance } from 'db/repository';
import { getVinForNetId } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';

let stanceConfig: Stance.Model[];

export const loadStanceConfig = async () => {
  await Config.awaitConfigLoad();
  stanceConfig = Config.getConfigValue('vehicles.stance');
};

export const getModelStanceData = (model: number) => {
  return stanceConfig.filter(c => GetHashKey(c.model) === model);
};

export const setVehicleStance = (veh: number, stanceData: Stance.Data) => {
  const vehState = Entity(veh).state;
  if (!vehState) return;
  vehState.set('stance', stanceData, true);
};

export const getVehicleStance = (veh: number): Stance.Data | null => {
  const vehState = Entity(veh).state;
  if (!vehState?.stance) return null;
  return vehState.stance;
};

export const saveStance = (netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin || !vinManager.isVinFromPlayerVeh(vin)) return;
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (!veh) return;
  const stanceData = getVehicleStance(veh);
  if (!stanceData) return;
  updateVehicleStance(vin, stanceData);
  Util.Log(
    'vehicles:saveStance',
    {
      vin,
      stanceData,
    },
    `Stance has been saved for ${vin}`
  );
};
