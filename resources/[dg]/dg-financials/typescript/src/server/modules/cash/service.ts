import { cashLogger } from './util';

const cashCache: Map<number, number> = new Map();

const updateMetadata = (ply: Player) => {
  const cid = ply.PlayerData.citizenid;
  const cash = cashCache.get(cid);
  ply.Functions.setCash(cash);
};

export const getCash = (src: number | string): number => {
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    cashLogger.error(`getCash: Player not found for ${src}`);
    return 0;
  }
  const cid = Player.PlayerData.citizenid;
  if (cashCache.has(cid)) {
    cashLogger.debug(`getCash: Cache hit for ${cid} (${cashCache.get(cid)})`);
    return cashCache.get(cid);
  }
  cashLogger.debug(`getCash: Player ${cid} not found in cashCache - fetching from PlayerData`);
  seedPlyInCache(Player.PlayerData.source);
  return getCash(src);
};

// It adds the user with to the cash cache
export const seedPlyInCache = (src: number | string) => {
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    cashLogger.error(`Failed to seed cash cache for ${src}`);
    return;
  }
  const PlyData = Player.PlayerData;
  if (cashCache.has(PlyData.citizenid)) {
    cashLogger.warn(`Cash cache already set for ${PlyData.citizenid}(${PlyData.name}), overwriting`);
  }
  cashLogger.silly(`Seeding cash cache for ${PlyData.citizenid}(${PlyData.name}) with ${PlyData.charinfo.cash}`);
  cashCache.set(PlyData.citizenid, PlyData.charinfo.cash);
};

export const seedCache = () => {
  cashCache.clear();
  DGCore.Functions.GetPlayers().forEach(player => {
    seedPlyInCache(player);
  });
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
  global.exports['dg-logs'].createGraylogEntry('cash:remove', {
    cid,
    cash,
    amount,
    reason,
  });
  updateMetadata(Player);
  emitNet('hud:client:OnMoneyChange', src, 'cash', amount, true);
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
  global.exports['dg-logs'].createGraylogEntry('cash:add', {
    cid,
    cash,
    amount,
    reason,
  });
  updateMetadata(Player);
  emitNet('hud:client:OnMoneyChange', src, 'cash', amount, false);
};
