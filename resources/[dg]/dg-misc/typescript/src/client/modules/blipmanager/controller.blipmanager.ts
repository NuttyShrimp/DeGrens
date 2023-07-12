import { BaseEvents, Sync } from '@dgx/client';
import {
  addBlip,
  addPlayerBlip,
  changeBlipCoords,
  changePlayerBlipSprite,
  deletePlayerBlip,
  disableCategory,
  enableCategory,
  handlePlayerEnteredScope,
  handlePlayerLeftScope,
  removeBlip,
  removeCategory,
  updatePlayerBlipCoords,
} from './service.blipmanager';

global.exports('addBlip', addBlip);
global.exports('removeBlip', removeBlip);
global.exports('enableCategory', enableCategory);
global.exports('disableCategory', disableCategory);
global.exports('removeCategory', removeCategory);
global.exports('changeBlipCoords', changeBlipCoords);

global.exports('addPlayerBlip', addPlayerBlip);
global.exports('deletePlayerBlip', deletePlayerBlip);
global.exports('changePlayerBlipSprite', changePlayerBlipSprite);

BaseEvents.onPlayerEnteredScope(handlePlayerEnteredScope);
BaseEvents.onPlayerLeftScope(handlePlayerLeftScope);

Sync.onPlayerCoordsUpdate((plyCoords: Record<number, Vec3>) => {
  for (const key in plyCoords) {
    const plyId = Number(key);
    updatePlayerBlipCoords(plyId, plyCoords[plyId]);
  }
});
