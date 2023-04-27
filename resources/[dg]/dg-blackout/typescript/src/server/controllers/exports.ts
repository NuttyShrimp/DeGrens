import blackoutManager from 'classes/BlackoutManager';

global.exports('toggleBlackout', () => {
  blackoutManager.setBlackoutState(!blackoutManager.getBlackoutState());
});
