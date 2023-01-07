import { Keys } from '@dgx/client';
import { getPlayerState, respawnButtonPressed, respawnButtonReleased, setPauseDownAnimation } from './service.down';

global.exports('pauseDownAnimation', setPauseDownAnimation);
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
