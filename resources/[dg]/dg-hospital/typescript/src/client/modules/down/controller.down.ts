import { BaseEvents, Keys } from '@dgx/client';
import { getPlayerState, loadPedFlags, respawnButtonPressed, respawnButtonReleased } from './service.down';

global.exports('isDown', () => {
  return getPlayerState() !== 'alive';
});

Keys.onPress('GeneralUse', down => {
  if (getPlayerState() !== 'alive' && down) {
    respawnButtonPressed();
  } else {
    respawnButtonReleased();
  }
});

BaseEvents.onPedChange(() => {
  loadPedFlags();
});
