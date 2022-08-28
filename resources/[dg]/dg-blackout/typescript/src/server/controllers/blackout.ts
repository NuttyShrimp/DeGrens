import { Config, Events, RPC, Util } from '@dgx/server';

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

RPC.register('blackout:server:getBlackoutState', () => {
  return blackoutManager.state;
});

RPC.register('blackout:server:getSafeZones', async () => {
  await Config.awaitConfigLoad();
  return Config.getConfigValue<ZoneData[]>('blackout.safezones');
});

global.exports('toggleBlackout', () => {
  blackoutManager.state = !blackoutManager.state;
});
