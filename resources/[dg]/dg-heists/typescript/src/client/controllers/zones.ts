import { PolyZone } from '@dgx/client';
import { handlePlayerEnteredLocation, handlePlayerLeftLocation } from 'services/locations';

PolyZone.onEnter<{ id: Heists.LocationId }>('heists_location', (_, data) => {
  handlePlayerEnteredLocation(data.id);
});

PolyZone.onLeave<{ id: Heists.LocationId }>('heists_location', (_, data) => {
  handlePlayerLeftLocation(data.id);
});
