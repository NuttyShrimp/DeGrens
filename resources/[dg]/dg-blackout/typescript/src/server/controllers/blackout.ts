import { Chat, RPC, Util } from '@dgx/server/classes';
import blackoutManager from '../classes/BlackoutManager';

onNet('dg-blackout:server:SetBlackout', (state: boolean) => {
  blackoutManager.state = state;
  Util.Log(
    'blackout:toggle',
    { blackout: blackoutManager.state, source: source },
    `Blackout has been ${blackoutManager.state ? 'enabled' : 'disabled'} by an event.`
  );
});

Chat.registerCommand('toggleblackout', 'Zet de huidige status van blackout', [], 'admin', (source: number) => {
  blackoutManager.state = !blackoutManager.state;
  Util.Log(
    'blackout:toggle',
    { blackout: blackoutManager.state, source: source },
    `Blackout has been ${blackoutManager.state ? 'enabled' : 'disabled'} by the command.`
  );
});

RPC.register('dg-blackout:server:GetBlackoutState', () => {
  return blackoutManager.state;
});
