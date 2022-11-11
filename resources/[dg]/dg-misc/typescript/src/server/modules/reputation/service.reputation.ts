import { Util } from '@dgx/server';
import { fetchReputationsForCid, insertDefaultForCid, updateReputationForCid } from './helpers.reputation';
import { reputationLogger } from './logger.reputation';

// Key: cid, Value: (Key: type, Value: reputation)
const playerReputations = new Map<number, Map<string, number>>();

export const loadAllPlayerReputations = () => {
  (
    Object.values({
      ...DGCore.Functions.GetQBPlayers(),
    }) as Player[]
  ).forEach((ply: Player) => {
    loadPlayerReputation(ply.PlayerData.citizenid);
  });
};

export const loadPlayerReputation = async (cid: number, alreadyInsertedDefaults = false) => {
  const reputations = await fetchReputationsForCid(cid);
  if (Object.keys(reputations).length === 0) {
    if (alreadyInsertedDefaults) {
      reputationLogger.error(`Reputations for CID ${cid} still null after inserting defaults`);
      Util.Log('reputations:failedDefaults', { cid }, `Reputations for CID ${cid} still null after inserting defaults`);
      return;
    }
    await insertDefaultForCid(cid);
    reputationLogger.silly(`Default reputations for CID ${cid} have been inserted`);

    loadPlayerReputation(cid, true);
    return;
  }
  playerReputations.set(cid, new Map(Object.entries(reputations)));
  reputationLogger.silly(`Reputations for CID ${cid} have been loaded`);
};

export const unloadPlayerReputation = (cid: number) => {
  playerReputations.delete(cid);
  reputationLogger.silly(`Reputations for CID ${cid} have been unloaded`);
};

export const getReputation = (cid: number, type: ReputationType) => {
  const reputations = playerReputations.get(cid);
  if (!reputations) {
    reputationLogger.warn(`Tried to get reputations for CID ${cid} but player was not in server`);
    return;
  }
  const rep = reputations.get(type);
  if (rep === undefined) {
    reputationLogger.warn(`Tried to get ${type} reputation for CID ${cid} but is not a know reptype`);
    Util.Log('reputations:unknownType', { type }, `Tried to set value for unknown reptype '${type}'`);
    return;
  }
  return rep;
};

export const setReputation = (cid: number, type: ReputationType, cb: (old: number) => number) => {
  const oldRep = getReputation(cid, type);
  if (oldRep === undefined) return; // logging happens in getReputation
  const newRep = cb(oldRep);
  playerReputations.get(cid)!.set(type, newRep); // undefined gets check in getReputation
  updateReputationForCid(cid, type, newRep);
};
