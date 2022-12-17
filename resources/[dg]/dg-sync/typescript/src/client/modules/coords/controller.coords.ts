import { getPlayerCoords, setAllPlayerCoords, getAllPlayerCoords } from './service.coords';

onNet('sync:coords:sync', (coords: Record<number, Vec3>) => {
  setAllPlayerCoords(coords);
});

global.exports('getAllPlayerCoords', getAllPlayerCoords);
global.exports('getPlayerCoords', getPlayerCoords);
