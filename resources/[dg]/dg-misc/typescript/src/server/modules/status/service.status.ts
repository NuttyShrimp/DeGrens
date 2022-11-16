import { Chat, Config, Notifications, Util } from '@dgx/server';
import { statusLogger } from './logger.status';

const statusData = new Map<Status.Name, Status.ConfigData>();
const allPlayerStatuses = new Map<number, Status.Active[]>();

const getStatusData = (name: Status.Name) => {
  const data = statusData.get(name);
  if (!data) {
    statusLogger.warn(`Tried to get status data for '${name}' but is not a known status`);
    Util.Log(
      'misc:status:unknown',
      { name },
      `Tried to get status data for '${name}' status but is not a known status`,
      undefined,
      true
    );
    return;
  }
  return data;
};

export const loadStatusData = async () => {
  await Config.awaitConfigLoad();
  const config = Config.getModuleConfig('playerstatuses') as Status.ConfigData[];
  config.forEach(c => statusData.set(c.name, c));
  statusLogger.silly(`${statusData.size} Statuses have been loaded from config`);
};

export const addStatusToPlayer = (plyId: number, name: Status.Name) => {
  const data = getStatusData(name);
  if (!data) return;

  // Get all ply statuses or initialize if not existing yet
  const cid = Util.getCID(plyId);
  let playerStatuses = allPlayerStatuses.get(cid);
  if (!playerStatuses) playerStatuses = [];

  // If already has status then remove and clear possible timeout
  const idx = playerStatuses.findIndex(s => s.name === name);
  if (idx !== -1) {
    if (playerStatuses[idx].timeout) {
      clearTimeout(playerStatuses[idx].timeout);
    }
    playerStatuses.splice(idx, 1);
  }

  // Add new status and start possible timeout
  const newStatus: Status.Active = { name };
  if (data.duration !== undefined) {
    const timeout = setTimeout(() => {
      removeStatusFromPlayer(plyId, name);
    }, data.duration * 60 * 1000);
    newStatus.timeout = timeout;
  }
  playerStatuses.push(newStatus);
  allPlayerStatuses.set(cid, playerStatuses);

  Chat.sendMessage(plyId, {
    prefix: 'Status: ',
    message: data.label,
    type: 'normal',
  });
  statusLogger.silly(`Added status ${name} to player ${cid}`);
};

const removeStatusFromPlayer = (plyId: number, name: Status.Name) => {
  const data = getStatusData(name);
  if (!data) return;
  const cid = Util.getCID(plyId);
  const playerStatuses = allPlayerStatuses.get(cid);
  if (!playerStatuses) return;
  const idx = playerStatuses.findIndex(s => s.name === name);
  if (idx === -1) return; // No logging because this can happen often when removalmethod happens without ply having the status

  // Remove active status and clear possible timeout
  if (playerStatuses[idx].timeout) {
    clearTimeout(playerStatuses[idx].timeout);
  }
  playerStatuses.splice(idx, 1);
  if (data.removalMessage) {
    Notifications.add(plyId, data.removalMessage, 'info');
  }
  statusLogger.silly(`Removed status ${name} from player ${cid}`);
};

export const checkRemovalMethods = (plyId: number, method: Status.RemovalMethod) => {
  const cid = Util.getCID(plyId);
  const playerStatuses = allPlayerStatuses.get(cid);
  if (!playerStatuses) return;

  const statusesWithRemovalMethod = Array.from(statusData).reduce<Status.Name[]>((acc, [name, data]) => {
    if (data.removalMethod === method) acc.push(name);
    return acc;
  }, []);

  statusesWithRemovalMethod.forEach(name => removeStatusFromPlayer(plyId, name));
};

export const getPlayerStatuses = (plyId: number) => {
  const cid = Util.getCID(plyId);
  const playerStatuses = allPlayerStatuses.get(cid) ?? [];
  return playerStatuses.map(s => s.name);
};
