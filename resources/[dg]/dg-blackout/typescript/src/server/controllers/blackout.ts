import { Config, Chat, RPC, Util, Events } from '@dgx/server';
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

Chat.registerCommand('toggleblackout', 'Zet de huidige status van blackout', [], 'staff', (source: number) => {
  blackoutManager.state = !blackoutManager.state;
  Util.Log(
    'blackout:toggle',
    { blackout: blackoutManager.state, source: source },
    `Blackout has been ${blackoutManager.state ? 'enabled' : 'disabled'} by the command.`
  );
});

RPC.register('blackout:server:getBlackoutState', () => {
  return blackoutManager.state;
});

RPC.register('blackout:server:getSafeZones', async () => {
  await Config.awaitConfigLoad();
  return Config.getConfigValue<ZoneData[]>('blackout.safezones');
});
