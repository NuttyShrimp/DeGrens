import { BaseEvents, Keys } from '@dgx/client';
import {
  getPlayerState,
  handleDownAnimLoop,
  loadPedFlags,
  respawnButtonPressed,
  respawnButtonReleased,
} from './service.down';

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

BaseEvents.onEnteredVehicle(() => {
  handleDownAnimLoop();
});

BaseEvents.onLeftVehicle(() => {
  handleDownAnimLoop();
});
