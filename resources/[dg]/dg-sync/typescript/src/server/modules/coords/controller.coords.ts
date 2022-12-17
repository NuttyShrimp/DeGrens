import { getPlayerCoords, syncCoords } from './service.coords';

export const startCoordsThread = () => {
  setInterval(() => {
    syncCoords();
  }, 5000);
};

global.exports('getPlayerCoords', getPlayerCoords);
