import { Events, RPC } from '@dgx/server';
import { getStanceConfigForModel, loadStance, saveStanceAsOverride } from './service.stances';
import { getVinForVeh } from 'helpers/vehicle';
import { updateVehicleStance } from 'db/repository';

RPC.register('vehicles:stances:getModelConfig', (plyId, model: number) => {
  return getStanceConfigForModel(model);
});

Events.onNet('vehicles:stances:saveAsOverride', (plyId, netId: number, stance: Stances.Stance) => {
  saveStanceAsOverride(netId, stance);
});

Events.onNet(
  'vehicles:stances:reapply',
  (plyId, netId: number, originalStance: Stances.Stance, clearOverride: boolean, ignoreUpgrades: boolean) => {
    const vehicle = NetworkGetEntityFromNetworkId(netId);
    if (!vehicle || !DoesEntityExist(vehicle)) return;
    const vin = getVinForVeh(vehicle);
    if (!vin) return;

    if (clearOverride) {
      updateVehicleStance(vin, null);
    }

    loadStance({
      vin,
      vehicle,
      original: originalStance,
      checkOverrideStance: !clearOverride,
      ignoreUpgrades,
    });
  }
);
