import { Events, Sounds, RPC, Notifications, UI, Util, Jobs, Inventory, Police, Hospital, Core } from '@dgx/server';
import { getPoliceConfig } from 'services/config';
import { forceStopInteractions, isPlayerInActiveInteraction } from '../service.interactions';

// Key: server id
const cuffedPlayers = new Map<number, Police.CuffType>();
// Key: cid
const cuffLogs = new Map<number, { time: number; name: string }[]>();

export const isPlayerCuffed = (plyId: number) => {
  return cuffedPlayers.has(plyId);
};

const setCuffState = async (plyId: number, state: Police.CuffType | null, replicate = false) => {
  if (replicate) {
    Events.emitNet('police:interactions:setCuffState', plyId, state);
  }

  if (state === null) {
    cuffedPlayers.delete(plyId);
    await forceStopInteractions(plyId);
    return;
  }

  cuffedPlayers.set(plyId, state);
};

const insertCuffLog = async (cuffedPlayer: number, cuffingPlayer: number) => {
  if (Jobs.getCurrentJob(cuffingPlayer) !== 'police') return;

  const cid = Util.getCID(cuffedPlayer);
  const name = await Util.getCharName(Util.getCID(cuffingPlayer));
  const logs = cuffLogs.get(cid) ?? [];
  logs.push({ time: Date.now(), name });
  cuffLogs.set(cid, logs);
};

global.exports('isCuffed', isPlayerCuffed);

export const forceUncuff = (plyId: number) => {
  if (!isPlayerCuffed(plyId)) return;
  return setCuffState(plyId, null, true);
};
global.asyncExports('forceUncuff', forceUncuff);

global.exports('cycleCuffs', (plyId: number) => {
  const cuffState = cuffedPlayers.get(plyId);
  if (!cuffState) {
    Events.emitNet('police:interactions:forceCuff', plyId);
  } else {
    setCuffState(plyId, cuffState === 'hard' ? 'soft' : null, true);
  }
});

Events.onNet('police:interactions:tryToCuff', async (src: number, target: number) => {
  // Check if has cuffitem or is cop
  const hasCuffs = Jobs.getCurrentJob(src) === 'police' || (await Inventory.doesPlayerHaveItems(src, 'hand_cuffs'));
  if (!hasCuffs) return;

  // Player cannot be in interaction or be down/cuffed
  if (isPlayerCuffed(src) || Hospital.isDown(src) || isPlayerInActiveInteraction(src)) return;

  // Distance check but allow for a little desync
  const targetCoords = Util.getPlyCoords(target);
  if (Util.getPlyCoords(src).distance(targetCoords) > 3) return;

  // When trying to cuff, we timeout to check if player is still nearby after timeout
  const timeout = isPlayerCuffed(target) ? 0 : getPoliceConfig().config.cuffTimeout;
  setTimeout(async () => {
    // Check if player is still in range after desync
    const targetCoords = Util.getPlyCoords(target);
    if (Util.getPlyCoords(src).distance(targetCoords) > 3) return;

    const targetPed = GetPlayerPed(String(target));

    const cuffState = cuffedPlayers.get(target);
    if (!cuffState) {
      const originPed = GetPlayerPed(String(src));
      const coords = Util.getOffsetFromPlayer(src, { x: 0, y: 0.5, z: -0.9 });
      const heading = GetEntityHeading(originPed);

      Events.emitNet('police:interactions:doCuff', src);
      Events.emitNet('police:interactions:getCuffed', target, { ...coords, w: heading });

      insertCuffLog(target, src);
      Util.Log('police:interactions:cuff', { target }, `${Util.getName(src)} has cuffed a player`, src);

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

      const success = await RPC.execute<boolean>('police:interactions:doUncuff', src, target);
      if (success) {
        setCuffState(target, cuffState === 'hard' ? 'soft' : null, true);
      }
      Util.Log('police:interactions:uncuff', { target }, `${Util.getName(src)} has uncuffed a player once`, src);
    }
  }, timeout);
});

Events.onNet('police:interactions:setCuffState', (plyId: number, state: Police.CuffType | null) => {
  setCuffState(plyId, state);
});

Events.onNet('police:interactions:showCuffLogs', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;

  const closestPlayer = Util.getClosestPlayerOutsideVehicle(src, 3);
  if (!closestPlayer) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }

  const targetCid = Util.getCID(src);
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

  UI.openContextMenu(src, menu);
});

Core.onPlayerUnloaded((plyId, cid) => {
  if (!isPlayerCuffed(plyId)) return;
  Util.Log('police:interactions:droppedWithCuffs', { plyId, cid }, `Player ${cid} unloaded while cuffed`);
  cuffedPlayers.delete(plyId);
});
