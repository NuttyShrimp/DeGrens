import { Events, PolyZone, Util, UI, RPC } from '@dgx/client';
import { PED_MODELS } from './constants.scrapyard';
import {
  cleanupScrapyard,
  removeVehicleBlip,
  setInReturnZone,
  setVehicleBlip,
  setVehicleNetId,
} from './service.scrapyard';

Events.onNet('jobs:scrapyard:cleanup', () => {
  cleanupScrapyard();
});

Events.onNet('jobs:scrapyard:startJob', (netId: number, location: Vec4 | undefined) => {
  setVehicleNetId(netId);

  // location undefined when events get used while job is active and veh has already been lockpicked
  if (location) {
    setVehicleBlip(location);
  }
});

RPC.register('jobs:scrapyard:spawnPed', async (location: Vec4) => {
  const model = PED_MODELS[Math.floor(Math.random() * PED_MODELS.length)];
  const ped = await Util.spawnAggressivePed(model, location);
  if (!ped) return;
  TaskCombatPed(ped, PlayerPedId(), 0, 16);
  return NetworkGetNetworkIdFromEntity(ped);
});

PolyZone.onEnter('scrapyard_return', () => {
  UI.showInteraction('Werkplaats');
  setInReturnZone(true);
});
PolyZone.onLeave('scrapyard_return', () => {
  UI.hideInteraction();
  setInReturnZone(false);
});

Events.onNet('jobs:scrapyard:removeBlip', () => {
  removeVehicleBlip();
});
