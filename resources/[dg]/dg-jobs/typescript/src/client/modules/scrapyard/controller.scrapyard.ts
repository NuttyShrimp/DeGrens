import { Events, PolyZone, UI } from '@dgx/client';
import { cleanupScrapyard, setInScrapyardReturnZone, setScrapyardVehicleNetId } from './service.scrapyard';

Events.onNet('jobs:scrapyard:cleanup', cleanupScrapyard);
Events.onNet('jobs:scrapyard:setVehicle', setScrapyardVehicleNetId);

PolyZone.onEnter('scrapyard_return', () => {
  UI.showInteraction('Werkplaats');
  setInScrapyardReturnZone(true);
});
PolyZone.onLeave('scrapyard_return', () => {
  UI.hideInteraction();
  setInScrapyardReturnZone(false);
});
