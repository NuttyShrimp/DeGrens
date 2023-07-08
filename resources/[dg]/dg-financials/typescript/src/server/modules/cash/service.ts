import { Admin, Core, Events, Util } from '@dgx/server';
import { cashLogger } from './util';

const cashCache: Map<number, number> = new Map();

const updateMetadata = (ply: Core.Characters.Player) => {
  const cid = ply.citizenid;
  const cash = cashCache.get(cid);
  if (cash === undefined) return;
  ply.updateMetadata('cash', cash);
};

export const getCash = (src: number | string): number => {
  const playerData = Core.getPlayer(Number(src));
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
  const newCash = playerData.metadata?.cash ?? 0;
  cashCache.set(cid, newCash);
  return newCash;
};

export const removeCash = (src: number | string, amount: number, reason: string) => {
  const Player = Core.getPlayer(Number(src));
  if (!Player) {
    cashLogger.error(`removeCash: Player not found for ${src}`);
    return false;
  }
  if (!reason || reason.length === 0) {
    cashLogger.error(`removeCash: No reason provided | src: ${src} | amount: ${amount}`);
    if (Number(src) > 0) {
      Admin.ACBan(Number(src), `Transferring cash via a non-official way`, {
        amount,
        reason,
      });
    }
    return false;
  }
  const cid = Player.citizenid;
  const cash = getCash(src);
  amount = Number(amount.toFixed(0));
  if (cash < amount) {
    cashLogger.debug(`Player ${cid} does not have enough cash (${cash} < ${amount})`);
    return false;
  }
  cashLogger.silly(`Player ${cid} has ${cash} cash, removing ${amount}`);
  cashCache.set(cid, Number((cash - amount).toFixed(0)));
  Util.Log(
    'cash:remove',
    {
      cash,
      amount,
      reason,
    },
    `Cash has been removed from ${Util.getName(src)}`,
    +src
  );
  updateMetadata(Player);
  Events.emitNet('financials:client:cashChange', Number(src), cash - amount, -amount);
  return true;
};

export const addCash = (src: number | string, amount: number, reason: string) => {
  const Player = Core.getPlayer(Number(src));
  if (!Player) {
    cashLogger.error(`addCash: Player not found for ${src}`);
    return false;
  }
  if (!reason || reason.length === 0) {
    cashLogger.error(`addCash: No reason provided | src: ${src} | amount: ${amount}`);
    if (Number(src) > 0) {
      Admin.ACBan(Number(src), `Transferring cash via a non-official way`, {
        amount,
        reason,
      });
    }
    return false;
  }
  const cid = Player.citizenid;
  const cash = getCash(src);
  amount = Number(amount.toFixed(0));
  cashLogger.silly(`Player ${cid} has ${cash} cash, adding ${amount}`);
  cashCache.set(cid, Number((Number(cash) + amount).toFixed(0)));
  Util.Log(
    'cash:add',
    {
      cash,
      amount,
      reason,
    },
    `Cash has been added to ${Util.getName(src)}`,
    +src
  );
  updateMetadata(Player);
  Events.emitNet('financials:client:cashChange', Number(src), cash + amount, amount);
  return true;
};
