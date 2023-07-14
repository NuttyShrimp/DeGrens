import { Events, PolyZone, UI } from '@dgx/client';
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
