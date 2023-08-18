import { Events, Sync } from '@dgx/server';
import { getVinForVeh } from 'helpers/vehicle';

export const startMissionEntityEnforcingThread = (vehicle: number) => {
  const vin = getVinForVeh(vehicle);
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  Sync.executeAction('vehicles:missionentity:startThread', vehicle, {
    vin,
    netId,
    vehicle,
  });
};

Events.onNet('vehicles:missionentity:transfer', (plyId, data: { vin: string; netId: number; vehicle: number }) => {
  const vehicle = NetworkGetEntityFromNetworkId(data.netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  // entity handle should always stay same, we receive original handle from client to check if netId still corresponds to original vehicle
  if (vehicle !== data.vehicle) return;

  // we check if vehicle still has same vin as it had when thread was started
  const vin = getVinForVeh(vehicle);
  if (vin !== data.vin) return;

  Sync.executeAction('vehicles:missionentity:startThread', vehicle, data);
});
