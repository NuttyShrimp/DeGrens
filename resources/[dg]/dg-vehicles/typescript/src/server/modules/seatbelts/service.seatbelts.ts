import { updateVehicleHarness } from 'db/repository';
import vinManager from 'modules/identification/classes/vinmanager';

export const setVehicleHarnessUses = (vin: string, uses: number) => {
  const netId = vinManager.getNetId(vin);
  if (!netId) return;
  const veh = NetworkGetEntityFromNetworkId(netId);
  const vehState = Entity(veh).state;
  if (!vehState) return;
  vehState.harnessUses = uses;
  if (vinManager.isVinFromPlayerVeh(vin)) {
    updateVehicleHarness(vin, uses);
  }
};

export const getVehicleHarnessUses = (vin: string) => {
  const netId = vinManager.getNetId(vin);
  if (!netId) return;
  const veh = NetworkGetEntityFromNetworkId(netId);
  const vehState = Entity(veh).state;
  if (!vehState) return;
  return vehState.harnessUses as number;
};
