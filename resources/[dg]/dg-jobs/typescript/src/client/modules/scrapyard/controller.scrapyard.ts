import { Events, Peek, PolyZone, Util, UI } from '@dgx/client';
import { PED_MODELS } from './constants.scrapyard';
import {
  cleanupScrapyard,
  removeVehicleBlip,
  setInReturnZone,
  setVehicleBlip,
  setVehicleNetId,
} from './service.scrapyard';

Peek.addFlagEntry('isScrapyardMfer', {
  options: [
    {
      label: 'Neem opdracht',
      icon: 'fas fa-file',
      action: () => {
        Events.emitNet('jobs:scrapyard:signIn');
      },
    },
    {
      label: 'Geef onderdeel',
      icon: 'fas fa-box',
      action: () => {
        Events.emitNet('jobs:scrapyard:givePart');
      },
    },
  ],
});

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

Events.onNet('jobs:scrapyard:spawnPed', async (location: Vec4) => {
  const model = PED_MODELS[Math.floor(Math.random() * PED_MODELS.length)];
  const ped = await Util.spawnAggressivePed(model, location);
  if (!ped) return;
  TaskCombatPed(ped, PlayerPedId(), 0, 16);
  SetPedAsNoLongerNeeded(ped);
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
