import { Util } from '@dgx/server';
import { cashLogger } from './util';

const cashCache: Map<number, number> = new Map();

const updateMetadata = (ply: Player) => {
  const cid = ply.PlayerData.citizenid;
  const cash = cashCache.get(cid);
  if (!cash) return;
  ply.Functions.setCash(cash);
};

export const getCash = (src: number | string): number => {
  const playerData = DGCore.Functions.GetPlayer(src)?.PlayerData;
  if (!playerData) {
    cashLogger.error(`getCash: Player not found for ${src}`);
    return 0;
  }
  const cid = playerData.citizenid;
  const cash = cashCache.get(cid);
  if (cash !== undefined) {
    cashLogger.debug(`getCash: Cache hit for ${cid} (${cash})`);
    return cash;
  }
  cashLogger.debug(`getCash: Player ${cid} not found in cashCache - fetching from PlayerData`);
  const newCash = playerData.charinfo?.cash ?? 0;
  cashCache.set(cid, newCash);
  return newCash;
};

export const removeCash = (src: number | string, amount: number, reason: string) => {
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    cashLogger.error(`removeCash: Player not found for ${src}`);
    return false;
  }
  if (!reason || reason.length === 0) {
    // TODO: Add cheat detection banning/flagging BS
    cashLogger.error(`removeCash: No reason provided | src: ${src} | amount: ${amount}`);
    return false;
  }
  const cid = Player.PlayerData.citizenid;
  const cash = getCash(src);
  if (cash < amount) {
    cashLogger.debug(`Player ${cid} does not have enough cash (${cash} < ${amount})`);
    return false;
  }
  cashLogger.silly(`Player ${cid} has ${cash} cash, removing ${amount}`);
  cashCache.set(cid, cash - amount);
  Util.Log(
    'cash:remove',
    {
      cid,
      cash,
      amount,
      reason,
    },
    `Cash has been removed from ${Util.getName(src)}`
  );
  updateMetadata(Player);
  emitNet('hud:client:OnMoneyChange', src, cash, -amount);
  return true;
};

export const addCash = (src: number | string, amount: number, reason: string) => {
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    cashLogger.error(`addCash: Player not found for ${src}`);
    return false;
  }
  if (!reason || reason.length === 0) {
    // TODO: Add cheat detection banning/flagging BS
    cashLogger.error(`addCash: No reason provided | src: ${src} | amount: ${amount}`);
    return false;
  }
  const cid = Player.PlayerData.citizenid;
  const cash = getCash(src);
  cashLogger.silly(`Player ${cid} has ${cash} cash, adding ${amount}`);
  cashCache.set(cid, Number(cash) + Number(amount));
  Util.Log(
    'cash:add',
    {
      cid,
      cash,
      amount,
      reason,
    },
    `Cash has been added to ${Util.getName(src)}`
  );
  updateMetadata(Player);
  emitNet('hud:client:OnMoneyChange', src, cash, amount);
  return true;
};
