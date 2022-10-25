import { Events, Util } from '@dgx/server';

Events.onNet('vehicles:door:sync', (src: number, netId: number, doorId: number, state: boolean) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  Util.sendEventToEntityOwner(vehicle, 'vehicles:door:sync', netId, doorId, state);
});
