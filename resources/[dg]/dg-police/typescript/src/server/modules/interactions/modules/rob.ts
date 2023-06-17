import { RPC, Hospital, Events, Notifications, Util, Financials, Core, Inventory } from '@dgx/server';
import { isPlayerCuffed } from './cuffs';
import { isPlayerInActiveInteraction } from '../service.interactions';

const canRobPlayer = (plyId: number, target: number): Police.CanRob => {
  // Player cannot already be in interaction or be down/cuffed
  if (isPlayerCuffed(plyId) || Hospital.isDown(plyId) || isPlayerInActiveInteraction(plyId)) return 'notAllowed';

  // Distance check but allow a little desync
  const targetCoords = Util.getPlyCoords(target);
  if (Util.getPlyCoords(plyId).distance(targetCoords) > 5) return 'notAllowed';

  if (isPlayerCuffed(target)) return 'allowed';

  const targetPlayer = Core.getPlayer(target);
  const isDead = targetPlayer?.metadata?.downState === 'dead';

  return isDead ? 'allowed' : 'checkAnim';
};

RPC.register('police:interactions:canRobPlayer', canRobPlayer);

Events.onNet('police:interactions:robPlayer', (plyId: number, target: number) => {
  // validate target again as security measure but we cant doublecheck handsup anim from server
  if (canRobPlayer(plyId, target) === 'notAllowed') return;

  const targetPlayer = Core.getPlayer(target);
  if (!targetPlayer) return;

  Inventory.openOtherPlayer(plyId, target);

  const cash = Financials.getCash(target);
  const success = Financials.removeCash(target, cash, 'robbed-by-player');
  if (!success) return;
  Financials.addCash(plyId, cash, 'robbed-a-player');
  Notifications.add(plyId, `Je hebt €${cash} afgenomen`);
  Notifications.add(target, `Je bent berooft van €${cash}`);

  Util.Log(
    'police:interactions:robbedPlayer',
    {
      cid: targetPlayer.citizenid,
      serverId: targetPlayer.serverId,
      name: targetPlayer.name,
      steamId: targetPlayer.steamId,
    },
    `${Util.getName(plyId)}(${plyId}) has robbed ${targetPlayer.name}(${targetPlayer.serverId})`,
    plyId
  );
});
