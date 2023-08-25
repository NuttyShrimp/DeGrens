import { Events, Gangs, Notifications, SyncedObjects, Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import { ZONE_INFO } from '@shared/data/zones';
import dayjs from 'dayjs';

import { ctmLogger } from '../logger';

const zoneStates: Map<string, ZoneState> = new Map();
const objIds: string[] = [];

export const initZones = async () => {
  for (const zone of ZONE_INFO) {
    const ids = await SyncedObjects.add({
      coords: zone.origin,
      rotation: new Vector3(0, 0, 0),
      model: 'prop_golfflag',
      flags: {
        onFloor: true,
      },
      skipStore: true,
    });
    objIds.push(...ids);

    zoneStates.set(zone.name, {
      owner: 'The People',
      counter: 0,
      contested: false,
      plysInZone: {},
      thread: null,
      resetThread: null,
    });
  }
  const randomZones: number[] = [];
  while (randomZones.length < 7) {
    const random = Util.getRndInteger(0, ZONE_INFO.length - 1);
    if (!randomZones.includes(random)) {
      randomZones.push(random);
    }
  }
  randomZones.forEach(random => {
    const zone = ZONE_INFO[random];
    zoneStates.get(zone.name)!.owner = 'mafia';
    Events.emitNet('event:ctm:zone:ownerShip', -1, zone.name, 'mafia');
  });
  zoneStates.get('cayo_island')!.owner = 'mafia';
  Events.emitNet('event:ctm:zone:ownerShip', -1, 'cayo_island', 'mafia');
  for (let i = 0; i < ZONE_INFO.length; i++) {
    if (randomZones.includes(i)) return;
    setTimeout(
      () => {
        const zone = ZONE_INFO[i];
        const state = zoneStates.get(zone.name);
        if (state?.owner !== 'The People' || state.thread || state.resetThread || state.contested) return;
        startResetThread(zone.name);
      },
      Util.getRndInteger(0, 15) * 60000
    );
  }
};

export const startZoneCapture = (zoneName: string, src: number) => {
  const cid = Util.getCID(src);
  const plyGang = Gangs.getPlayerGangName(cid) || 'The People';
  const state = zoneStates.get(zoneName);
  if (!state) return;
  if (state.resetThread && state.owner === plyGang) {
    // Reset capture
    clearTimeout(state.resetThread);
    state.resetThread = null;
  }

  if (!state.plysInZone[plyGang]) {
    state.plysInZone[plyGang] = [];
  }
  state.plysInZone[plyGang] = [...state.plysInZone[plyGang], src];
  ctmLogger.debug(`Player ${cid} (${plyGang}) entered capture zone ${zoneName}`);

  if (state?.contested) {
    // Show notification that zone is contested
    Notifications.add(src, 'This zone is contested', 'error', undefined, true, 'zone-capture');
    return;
  }

  if (Object.keys(state.plysInZone).length > 1 && !state.contested) {
    // Check if player is still in there after 500ms
    setTimeout(() => {
      if (!state.plysInZone[plyGang].includes(src)) return;
      // Player is still in zone
      setZoneContested(zoneName);
    }, 500);
  }
  if (Object.keys(state.plysInZone).length === 1 && state.owner !== plyGang && !state.thread) {
    startCaptureThread(zoneName, plyGang);
  }
};

export const leaveZone = (zoneName: string, src: number) => {
  const cid = Util.getCID(src);
  const plyGang = Gangs.getPlayerGangName(cid) || 'The People';
  const state = zoneStates.get(zoneName);
  if (!state) return;
  const index = state.plysInZone[plyGang]?.indexOf(src);
  Notifications.remove(src, 'zone-capture');
  ctmLogger.debug(`Player ${cid} (${plyGang}) left zone ${zoneName}`);
  if (index > -1) {
    state.plysInZone[plyGang].splice(index, 1);
    if (state.plysInZone[plyGang].length === 0) {
      delete state.plysInZone[plyGang];
    }
  }
  // Nobody in zone, stop thread if running
  if (!state.plysInZone[plyGang] && !state.contested) {
    // Stop capture
    if (state.thread) {
      clearInterval(state.thread);
    }
    state.counter = 0;
    state.contested = false;
  }
  if (state.contested && Object.keys(state.plysInZone).length === 1) {
    // Zone is no longer contested
    state.contested = false;
    const gangInZone = Object.keys(state.plysInZone)[0];
    state.plysInZone[gangInZone].forEach(ply => {
      Notifications.remove(ply, 'zone-capture');
    });
    if (gangInZone === state.owner) return;
    startCaptureThread(zoneName, gangInZone);
  }
  if (state.owner === plyGang && !state.resetThread && !state.plysInZone[plyGang]) {
    startResetThread(zoneName);
  }
};

export const getZoneOwners = (): Record<string, string> => {
  const owners: Record<string, string> = {};
  zoneStates.forEach((state, zoneName) => {
    owners[zoneName] = state.owner;
  });
  return owners;
};

export const getMafiaZones = (): Record<string, ZoneState> => {
  const mafiaZones: Record<string, ZoneState> = {};
  zoneStates.forEach((state, zoneName) => {
    if (state.owner === 'mafia') {
      mafiaZones[zoneName] = state;
    }
  });
  return mafiaZones;
};

const setZoneContested = (zoneName: string) => {
  const state = zoneStates.get(zoneName);
  if (!state || state.contested) return;
  if (state.thread) {
    clearInterval(state.thread);
    state.thread = null;
  }
  // Zone is contested
  ctmLogger.debug(`Zone ${zoneName} is contested`);
  state.contested = true;
  Object.values(state.plysInZone).forEach(plys =>
    plys.forEach(ply => {
      Notifications.add(ply, 'This zone is contested', 'error', undefined, true, 'zone-capture');
    })
  );
};

const startResetThread = (zoneName: string) => {
  const state = zoneStates.get(zoneName);
  if (!state) return;
  ctmLogger.debug(`Zone ${zoneName} reset thread started`);
  state.resetThread = setTimeout(() => {
    if (state.thread !== null) return;
    state.owner = 'mafia';
    ctmLogger.info(`Zone ${zoneName} was resetted to mafia`);
    Events.emitNet('event:ctm:zone:ownerShip', -1, zoneName, 'mafia');
    state.resetThread = null;
  }, 60000 * 15);
};

const startCaptureThread = (zoneName: string, capturingGang: string) => {
  ctmLogger.debug(`Zone ${zoneName} is being captured`);
  const state = zoneStates.get(zoneName);
  if (!state) return;
  // Start capture
  state.counter = dayjs.unix(60);
  state.thread = setInterval(() => {
    if (state.counter.unix() <= 0) {
      return setZoneOwner(zoneName, capturingGang);
    }
    Object.values(state.plysInZone).forEach(plys =>
      plys.forEach(ply => {
        Notifications.add(
          ply,
          `Zone capture: ${state.counter.format('mm:ss:SSS')} remaining`,
          'info',
          undefined,
          true,
          'zone-capture'
        );
      })
    );
    state.counter = state.counter.subtract(1 + (state.plysInZone[capturingGang].length - 1) * 0.5, 'second');
  }, 1000);
};

export const setZoneOwner = (zoneName: string, newOwner: string) => {
  const state = zoneStates.get(zoneName);
  if (!state) return;
  ctmLogger.info(`Zone ${zoneName} was captured by ${newOwner}`);
  // change owner
  state.owner = newOwner;
  state.plysInZone[newOwner].forEach(ply => {
    Notifications.remove(ply, 'zone-capture');
    Notifications.add(ply, `Zone captured!`, 'success');
  });
  if (state.thread) {
    clearInterval(state.thread);
  }
  if (state.resetThread) {
    clearTimeout(state.resetThread);
  }
  state.resetThread = null;
  state.thread = null;
  state.counter = 0;
  Events.emitNet('event:ctm:zone:ownerShip', -1, zoneName, newOwner);
  return;
};

export const resetZoneState = (zoneName: string) => {
  const state = zoneStates.get(zoneName);
  if (!state) return;
  if (state.thread) {
    clearInterval(state.thread);
  }
  if (state.resetThread) {
    clearTimeout(state.resetThread);
  }
  state.resetThread = null;
  state.thread = null;
  state.counter = 0;
  state.owner = 'mafia';
  Object.keys(state.plysInZone).forEach(gang => {
    state.plysInZone[gang].forEach(ply => {
      Notifications.remove(ply, 'zone-capture');
    });
  });
  state.plysInZone = {};
  Events.emitNet('event:ctm:zone:ownerShip', -1, zoneName, 'mafia');
};
