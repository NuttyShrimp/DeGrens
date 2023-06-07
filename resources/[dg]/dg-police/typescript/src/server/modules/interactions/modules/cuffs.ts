import { Events, Sounds, RPC, Notifications, UI, Util, Jobs, Inventory, Police, Hospital, Core } from '@dgx/server';
import { getPoliceConfig } from 'services/config';
import { forceStopInteractions, isPlayerInActiveInteraction } from '../service.interactions';

// Key: server id
const cuffedPlayers = new Map<number, Police.CuffType>();
// Key: cid
const cuffLogs = new Map<number, { time: number; name: string }[]>();

const playersInCuffAction = new Set<number>();

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
  playersInCuffAction.delete(plyId);
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
  setCuffState(plyId, getNextCuffState(cuffState), true);
});

Events.onNet('police:interactions:tryToCuff', async (src: number, target: number) => {
  // Check if has cuffitem or is cop
  const hasCuffs = Jobs.getCurrentJob(src) === 'police' || (await Inventory.doesPlayerHaveItems(src, 'hand_cuffs'));
  if (!hasCuffs) return;

  if (playersInCuffAction.has(target)) return;

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
    playersInCuffAction.add(target);

    // do uncuffing if already cuffed
    const cuffState = cuffedPlayers.get(target);
    if (cuffState) {
      playCuffSound('uncuff', targetPed, 1500, 500);

      const success = await RPC.execute<boolean>('police:interactions:doUncuff', src, target);
      playersInCuffAction.delete(target);
      if (!success) return;

      const newCuffState = getNextCuffState(cuffState);
      setCuffState(target, newCuffState, true);
      Util.Log(
        'police:interactions:uncuff',
        { target, newCuffState },
        `${Util.getName(src)}(${src}) has uncuffed a player once`,
        src
      );
      return;
    }

    const originPed = GetPlayerPed(String(src));
    const coords = Util.getOffsetFromPlayer(src, { x: 0, y: 0.5, z: -0.9 });
    const heading = GetEntityHeading(originPed);

    playCuffSound('cuff', targetPed, 0, 2000);

    // only interaction for cuffing player is animation
    Events.emitNet('police:interactions:doCuff', src);

    const success = await RPC.execute<boolean>('police:interactions:getCuffed', target, { ...coords, w: heading });
    playersInCuffAction.delete(target);
    if (!success) return;

    setCuffState(target, 'hard');
    insertCuffLog(target, src);
    Util.Log('police:interactions:cuff', { target }, `${Util.getName(src)}(${src}) has cuffed a player`, src);
  }, timeout);
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

const playCuffSound = (sound: 'cuff' | 'uncuff', entity: number, startTimeout: number, endTimeout: number) => {
  setTimeout(() => {
    const soundId = `cuff-sound-${entity}`;
    Sounds.playOnEntity(soundId, sound, 'DLC_NUTTY_SOUNDS', NetworkGetNetworkIdFromEntity(entity));
    setTimeout(() => {
      Sounds.stop(soundId);
    }, endTimeout);
  }, startTimeout);
};

const getNextCuffState = (oldCuffState: Police.CuffType | null | undefined) => {
  if (!oldCuffState) return 'hard';
  return oldCuffState === 'hard' ? 'soft' : null;
};
