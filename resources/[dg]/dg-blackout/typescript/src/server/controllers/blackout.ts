import { Config, Events, Util, Auth } from '@dgx/server';
import blackoutManager from '../classes/BlackoutManager';

Events.onNet('blackout:server:setBlackout', (src: number, state: boolean) => {
  blackoutManager.state = state;
  Util.Log(
    'blackout:toggle',
    { blackout: blackoutManager.state, source: source },
    `Blackout has been ${blackoutManager.state ? 'enabled' : 'disabled'} by an event.`,
    src
  );
});

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();
  const safeZones = Config.getConfigValue<ZoneData[]>('blackout.safezones');
  Events.emitNet('blackout:server:buildSafeZones', plyId, safeZones);
});

global.exports('toggleBlackout', () => {
  blackoutManager.state = !blackoutManager.state;
});
