import { Sync } from '@dgx/client';
import { getPlayerCoords, setAllPlayerCoords, getAllPlayerCoords } from './service.coords';

Sync.onPlayerCoordsUpdate(coords => {
  setAllPlayerCoords(coords);
});

global.exports('getAllPlayerCoords', getAllPlayerCoords);
global.exports('getPlayerCoords', getPlayerCoords);
