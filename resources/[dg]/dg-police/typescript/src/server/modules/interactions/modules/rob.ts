import { RPC, Hospital, Events, Notifications, Util, Financials, Core } from '@dgx/server';
import { isPlayerCuffed } from './cuffs';
import { isPlayerInActiveInteraction } from '../service.interactions';

RPC.register('police:interactions:canRobPlayer', (src: number, target: number): Police.CanRob => {
  // Player cannot already be in interaction or be down/cuffed
  if (isPlayerCuffed(src) || Hospital.isDown(src) || isPlayerInActiveInteraction(src)) return 'notAllowed';

  // Distance check but allow a little desync
  const targetCoords = Util.getPlyCoords(target);
  if (Util.getPlyCoords(src).distance(targetCoords) > 5) return 'notAllowed';

  if (isPlayerCuffed(target)) return 'allowed';

  const targetPlayer = Core.getPlayer(target);
  const isDead = targetPlayer?.metadata?.downState === 'dead';

  return isDead ? 'allowed' : 'checkAnim';
});

Events.onNet('police:interactions:robbedPlayer', (src: number, target: number) => {
  const cash = Financials.getCash(target);
  const success = Financials.removeCash(target, cash, 'robbed-by-player');
  if (!success) return;
  Financials.addCash(src, cash, 'robbed-a-player');
  Notifications.add(src, `Je hebt €${cash} afgenomen`);
  Notifications.add(target, `Je bent berooft van €${cash}`);

  const targetPlayer = Core.getPlayer(target);
  Util.Log(
    'police:interactions:robbedPlayer',
    {
      cid: targetPlayer.citizenid,
      serverId: targetPlayer.serverId,
      name: targetPlayer.name,
      steamId: targetPlayer.steamId,
    },
    `${Util.getName(src)} has robbed ${targetPlayer.name}`,
    src
  );
});
