import { Events, Inventory, Jobs, Notifications, Util } from '@dgx/server';

// plyid to month
const playersInPrison = new Map<number, { months: number; thread: NodeJS.Timer }>();

export const moveAllPlayerItemsToPrisonStash = (plyId: number) => {
  const cid = Util.getCID(plyId);
  const stashId = `prison_items_${cid}`;
  Inventory.moveAllItemsToInventory('player', String(cid), 'stash', stashId);
};

export const sendPlayerToPrison = (plyId: number, months: number) => {
  const player = DGCore.Functions.GetPlayer(plyId);
  player.Functions.SetMetaData('jailMonths', months);
  Events.emitNet('police:prison:goToPrison', plyId);
  const thread = setInterval(() => {
    setPlayerMonths(plyId, old => old - 1);
  }, 1000 * 60);
  playersInPrison.set(plyId, { months, thread });
  moveAllPlayerItemsToPrisonStash(plyId);
  Jobs.signPlayerOutOfAnyJob(plyId);
};

export const isPlayerInJail = (plyId: number) => playersInPrison.has(plyId);

export const cleanupPlayerInJail = (plyId: number) => {
  const jailData = playersInPrison.get(plyId);
  if (!jailData) return;
  clearInterval(jailData.thread);
  playersInPrison.delete(plyId);
};

export const setPlayerMonths = (plyId: number, cb: (old: number) => number) => {
  const player = DGCore.Functions.GetPlayer(plyId);
  const jailData = playersInPrison.get(plyId);
  if (!player || !jailData) return;
  const oldMonths = Math.max(player.PlayerData.metadata.jailMonths, 1);
  const newMonths = cb(oldMonths);
  player.Functions.SetMetaData('jailMonths', newMonths);
  jailData.months = newMonths;
};

export const getPlayerMonths = (plyId: number) => {
  return playersInPrison.get(plyId)?.months;
};

export const leavePrison = (plyId: number) => {
  setPlayerMonths(plyId, () => -1);
  Events.emitNet('police:prison:leave', plyId);
  cleanupPlayerInJail(plyId);
  Notifications.add(plyId, 'Neem je spullen aan balie', 'success');
};

export const restorePlayerSentence = (plyId: number) => {
  const player = DGCore.Functions.GetPlayer(plyId);
  if (!player) return;
  const months = player.PlayerData.metadata.jailMonths;
  if (months === -1) return;

  Events.emitNet('police:prison:restoreSentence', plyId);
  const thread = setInterval(() => {
    setPlayerMonths(plyId, old => old - 1);
  }, 1000 * 60);
  playersInPrison.set(plyId, { months, thread });
  Jobs.signPlayerOutOfAnyJob(plyId);
};

export const getAllPlayersInPrison = () => {
  const ids = Array.from(playersInPrison.keys());
  return ids.map(id => {
    const charInfo = DGCore.Functions.GetPlayer(id)?.PlayerData.charinfo;
    const name = `${charInfo?.firstname ?? 'Unknown'} ${charInfo?.lastname ?? 'Person'}`;
    return { id, name: name, months: playersInPrison.get(id)!.months };
  });
};

// Only use in prisonzone leave event, otherwise shit will be bugged with ped position
export const escapePrison = (plyId: number) => {
  setPlayerMonths(plyId, () => -1);
  cleanupPlayerInJail(plyId);
  Notifications.add(plyId, 'Je bent ontsnapt uit de gevangenis', 'success');
};

export const reloadPeopleInPrison = () => {
  (
    Object.values({
      ...DGCore.Functions.GetQBPlayers(),
    }) as Player[]
  ).forEach((ply: Player) => {
    const months = ply.PlayerData.metadata.jailMonths;
    if (months === -1) return;
    sendPlayerToPrison(ply.PlayerData.source, months);
  });
};