import { Events, Jobs, Notifications, RPC, Sounds, UI, Util } from '@dgx/server';
import { getPoliceConfig } from 'services/config';

// Key: server id
const cuffedPlayers = new Map<number, Police.CuffType>();
// Key: cid
const cuffLogs = new Map<number, { time: number; name: string }[]>();
const escortingPlayers = new Map<number, number>();
const carryDuos: [number, number][] = [];

export const setPlayerCuffState = (plyId: number, state: Police.CuffType | null) => {
  if (state === null) {
    cuffedPlayers.delete(plyId);
    return;
  }
  cuffedPlayers.set(plyId, state);
};

export const isPlayerCuffed = (plyId: number) => {
  return cuffedPlayers.has(plyId);
};

export const doCuffAction = async (origin: number, target: number, coords: Vec3) => {
  const closestPlayer = Util.getClosestPlayerOutsideVehicle(origin, 1.5);
  if (target !== closestPlayer) return;
  const targetPed = GetPlayerPed(String(target));

  const cuffState = cuffedPlayers.get(target);
  if (!cuffState) {
    const originPed = GetPlayerPed(String(origin));
    const heading = GetEntityHeading(originPed);
    SetEntityCoords(targetPed, coords.x, coords.y, coords.z - 0.9, false, false, false, false);
    SetEntityHeading(targetPed, heading);
    Events.emitNet('police:interactions:getCuffed', target);
    Events.emitNet('police:interactions:doCuff', origin);
    insertCuffLog(target, origin);
    Util.Log('police:interactions:cuff', { target }, `${Util.getName(origin)} has cuffed a player`, origin);

    const soundId = `cuff-sound-${target}`;
    Sounds.playOnEntity(soundId, 'cuff', 'DLC_NUTTY_SOUNDS', NetworkGetNetworkIdFromEntity(targetPed));
    setTimeout(() => {
      Sounds.stop(soundId);
    }, 2000);
  } else {
    setTimeout(() => {
      const soundId = `uncuff-sound-${target}`;
      Sounds.playOnEntity(soundId, 'uncuff', 'DLC_NUTTY_SOUNDS', NetworkGetNetworkIdFromEntity(targetPed));
      setTimeout(() => {
        Sounds.stop(soundId);
      }, 500);
    }, 1500);

    const success = await RPC.execute<boolean>('police:interactions:doUncuff', origin);
    if (success) {
      Events.emitNet('police:interactions:getUncuffed', target);
    }
    Util.Log('police:interactions:uncuff', { target }, `${Util.getName(origin)} has uncuffed a player once`, origin);
  }
};

export const insertCuffLog = async (cuffedPlayer: number, cuffingPlayer: number) => {
  if (Jobs.getCurrentJob(cuffingPlayer) !== 'police') return;

  const cid = Util.getCID(cuffedPlayer);
  const name = await Util.getCharName(Util.getCID(cuffingPlayer));
  const logs = cuffLogs.get(cid) ?? [];
  logs.push({ time: Date.now(), name });
  cuffLogs.set(cid, logs);
};

export const showCuffLogs = (plyId: number, target: number) => {
  const targetCid = Util.getCID(target);
  const logs = cuffLogs.get(targetCid) ?? [];
  const menu: ContextMenu.Entry[] = [
    {
      title: 'Tijden van handboeien',
      disabled: true,
      icon: 'fas fa-handcuffs',
    },
  ];

  logs.forEach(log => {
    const date = new Date(log.time);
    menu.push({
      title: log.name,
      disabled: true,
      description: `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
    });
  });

  UI.openContextMenu(plyId, menu);
};

export const setPlayerEscorting = (origin: number, target: number) => {
  escortingPlayers.set(origin, target);
};
export const getEscortedPlayer = (plyId: number) => escortingPlayers.get(plyId);
export const isPlayerEscorting = (plyId: number) => escortingPlayers.has(plyId);
export const isPlayerBeingEscorted = (plyId: number) => {
  return Array.from(escortingPlayers.values()).includes(plyId);
};
export const stoppedEscorting = (plyId: number) => {
  escortingPlayers.delete(plyId);
};
export const getPlayerWhoIsEscorting = (plyId: number) => {
  for (const [origin, target] of escortingPlayers) {
    if (target !== plyId) continue;
    return origin;
  }
};

export const startCarryDuo = (origin: number) => {
  const plyMetadata = DGCore.Functions.GetPlayer(origin)?.PlayerData.metadata;
  if (!plyMetadata || isPlayerCuffed(origin) || plyMetadata.isdead || plyMetadata.inlaststand) return;

  const closestPlayerAtStart = Util.getClosestPlayerOutsideVehicle(origin, 1.5);
  if (!closestPlayerAtStart) {
    Notifications.add(origin, 'Er is niemand in de buurt', 'error');
    return;
  }

  const timeout = getPoliceConfig().config.carryTimeout;
  setTimeout(() => {
    const closestPlayer = Util.getClosestPlayerOutsideVehicle(origin, 1.5);
    if (closestPlayer !== closestPlayerAtStart) return;
    if (isPlayerInCarryDuo(closestPlayerAtStart) || isPlayerInCarryDuo(origin)) return;
    if (isPlayerBeingEscorted(closestPlayerAtStart)) return;

    carryDuos.push([origin, closestPlayer]);
    Events.emitNet('police:interactions:carryPlayer', origin);
    Events.emitNet('police:interactions:getCarried', closestPlayer, origin);
  }, timeout);
};

export const isPlayerInCarryDuo = (plyId: number) => {
  return carryDuos.find(duo => duo.includes(plyId)) !== undefined;
};

export const stopCarryDuo = (plyId: number, coords: Vec3) => {
  for (let i = 0; i < carryDuos.length; i++) {
    const [origin, target] = carryDuos[i];
    if (origin !== plyId && target !== plyId) continue;

    carryDuos.splice(i, 1);
    const targetPed = GetPlayerPed(String(target));
    SetEntityCoords(targetPed, coords.x, coords.y, coords.z - 0.9, false, false, false, false);
    Events.emitNet('police:interactions:stopCarry', origin);
    Events.emitNet('police:interactions:stopCarry', target);
    break;
  }
};
