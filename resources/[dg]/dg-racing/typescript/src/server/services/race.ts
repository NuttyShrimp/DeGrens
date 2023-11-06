import { Admin, Core, Events, Financials, Inventory, Notifications, Phone, SQL, Util, Vehicles } from '@dgx/server';
import { getTrackById } from './tracks';
import { mainLogger } from 'sv_logger';
import { charModule } from 'helpers/core';
import dayjs from 'dayjs';
import { hasDongle } from 'helpers/utils';

let races = new Map<number, Racing.RaceState>();
let runningRaces = new Map<number, Racing.RunningRaceState>();
let raceId = 1;

const calculateLeaderboard = (raceId: number) => {
  const raceInfo = runningRaces.get(raceId);
  if (!raceInfo) return;
  const leaderboard = Object.keys(raceInfo.passedPoints).sort((a, b) => {
    const cid1 = Number(a);
    const cid2 = Number(b);
    const cid1Laps = raceInfo.passedPoints[cid1];
    const cid2Laps = raceInfo.passedPoints[cid2];
    if (!cid1Laps) {
      return 1;
    }
    if (!cid2Laps) {
      return -1;
    }
    const cid1lap = Math.max(...Object.keys(cid1Laps).map(l => Number(l)));
    const cid2lap = Math.max(...Object.keys(cid2Laps).map(l => Number(l)));
    if (cid1lap >= 0 && cid1lap !== cid2lap) {
      return cid2lap - cid1lap;
    }
    const cid1Points = cid1Laps[cid1lap];
    const cid2Points = cid2Laps[cid2lap];
    if (cid1Points.length !== cid2Points.length) {
      return cid2Points.length - cid1Points.length;
    }
    const idx = cid1Points.length - 1;
    return cid1Points[idx] - cid2Points[idx];
  });
  raceInfo.leaderboard = leaderboard.map(v => Number(v));
};

const syncLeaderboard = (raceId: number) => {
  const raceInfo = runningRaces.get(raceId);
  if (!raceInfo) return;
  const race = races.get(raceId);
  if (!race) return;
  for (const participant of race.participants) {
    const srvId = charModule.getServerIdFromCitizenId(participant);
    if (!srvId) return;
    Events.emitNet('racing:race:setPosition', srvId, raceInfo.leaderboard.findIndex(e => e == participant) + 1);
  }
};

const calculateBestLap = (cid: number, raceId: number) => {
  const raceInfo = races.get(raceId);
  const raceState = runningRaces.get(raceId);
  if (!raceInfo || !raceState) return;
  const trackInfo = getTrackById(raceInfo.trackId);
  if (!trackInfo) return;
  if (raceInfo.laps) {
    let fastestLap = 0;
    // + 1 because the finish is always on recorded on the next lap in lap races
    for (let lap = raceInfo.laps + 1; lap > 1; lap--) {
      if (!raceState.passedPoints[cid]?.[lap]?.[0]) continue;
      const lapPace =
        raceState.passedPoints[cid][lap][0] - (raceState.passedPoints[cid][lap - 1]?.[0] ?? raceInfo.startTime);
      if (lapPace < fastestLap || fastestLap === 0) {
        fastestLap = lapPace;
      }
    }
    return fastestLap;
  }
  if (!raceState.passedPoints[cid]?.[1]?.[0]) return;
  return raceState.passedPoints[cid][1][trackInfo.checkpoints.length - 1] - raceState.passedPoints[cid][1][0];
};

const updateLeaderboardTime = async (cid: number, trackId: number, time: number, carModel: string, carName: string) => {
  const oldTimeResult = await SQL.query<{ time: number }[]>(
    'SELECT time from race_leaderboard WHERE cid = ? AND trackId = ? AND model = ?',
    [cid, trackId, carModel]
  );
  if (oldTimeResult && oldTimeResult[0]) {
    if (oldTimeResult[0].time < time) return;
    await SQL.query(
      'UPDATE race_leaderboard SET time = ? WHERE cid = ? AND trackId = ? AND model = ? AND carName = ?',
      [time, cid, trackId, carModel, carName]
    );
    return;
  }
  await SQL.insertValues('race_leaderboard', [
    {
      cid,
      trackId,
      time,
      model: carModel,
    },
  ]);
};

const calculateCryptoDistribution = (raceId: number) => {
  const race = races.get(raceId);
  if (!race) return;
  const raceState = runningRaces.get(raceId);
  if (!raceState) return;
  if (race.participants.length < 3) return;
  let price = Math.floor((Math.log2(race.participants.length / 2) + 0.5) * 20);
  raceState.cryptoDistribution = {};
  for (let i = 0; i < raceState.leaderboard.length; i++) {
    let cid = raceState.leaderboard[i];
    Financials.cryptoAdd(cid, 'Suliro', price, `Race ${raceId} - ${i} prize`);
    raceState.cryptoDistribution[cid] = price;
    price = Math.floor(price / 2);
  }

  for (const participant of race.participants) {
    const srvId = charModule.getServerIdFromCitizenId(participant);
    if (!srvId) return;
    Events.emitNet('racing:race:syncRacePrize', srvId, raceState.cryptoDistribution);
  }
};

// Dnf timer ran out or everyone finished
const stopRace = (raceId: number) => {
  const race = races.get(raceId);
  const raceState = runningRaces.get(raceId);
  if (!race || !raceState || race.state === 'ending') return;
  race.state = 'ending';
  if (raceState.dnfTimer) {
    clearTimeout(raceState.dnfTimer);
  }

  syncLeaderboard(race.id);

  calculateCryptoDistribution(raceId);
  for (const cid of race.participants) {
    const srvId = charModule.getServerIdFromCitizenId(cid);
    if (!srvId) return;
    Events.emitNet('racing:race:cleanupRace', srvId, false);
    Events.emitNet('racing:race:syncRaceStateApp', srvId, { state: race.state, leaderboardData: race.leaderboard });

    if (race.leaderboard) {
      if (raceState.disqualified.includes(cid)) return;
      const bestLapTime = calculateBestLap(cid, raceId);
      if (!bestLapTime) return;
      const ped = GetPlayerPed(String(srvId));
      const veh = GetVehiclePedIsIn(ped, false);
      if (!veh) return;
      const vehConfig = Vehicles.getConfigByEntity(veh);
      if (!vehConfig) return;
      updateLeaderboardTime(cid, race.trackId, bestLapTime, vehConfig.model, `${vehConfig.brand} ${vehConfig.name}`);
    }
  }

  setTimeout(
    () => {
      for (const cid of race.participants) {
        const srvId = charModule.getServerIdFromCitizenId(cid);
        if (!srvId) return;
        Events.emitNet('racing:race:cleanupRace', srvId, false);
        Events.emitNet('racing:race:syncRaceApp', srvId, undefined);
      }
      races.delete(raceId);
      runningRaces.delete(raceId);
    },
    5 * 60 * 1000
  );
};

const generateClientState = (raceId: number): Racing.ClientRaceState | null => {
  const race = races.get(raceId);
  if (!race) return null;

  const participantSrvIds: Record<number, number> = {};
  for (const participant of race.participants) {
    const srvId = charModule.getServerIdFromCitizenId(participant);
    if (!srvId) continue;
    participantSrvIds[participant] = srvId;
  }

  return {
    participants: participantSrvIds,
    id: race.id,
    startTime: race.startTime,
    laps: race.laps,
    classRestriction: race.classRestriction,
  };
};

export const setRaceAppState = async (src: number) => {
  const plyRaceId = getRaceIdForPly(src);
  if (plyRaceId) {
    Notifications.add(src, 'Je zit al in een race');
    return;
  }
  const race = races.get(raceId);
  if (!race) return;

  const charModule = Core.getModule('characters');
  const participants = await Promise.all(
    race.participants.map(async cid => {
      const ply = await charModule.getOfflinePlayer(cid);
      return { cid, name: ply?.metadata.racingAlias ?? 'Unknown racer' };
    })
  );

  Events.emitNet('racing:race:syncRaceApp', src, {
    id: race.id,
    trackId: race.trackId,
    participants,
    startTime: race.startTime,
    creator: race.creator,
    state: race.state,
    leaderboard: race.leaderboard,
    classRestriction: race.classRestriction,
  } satisfies Racing.AppRaceState);
};

export const getAvailableRaces = (src: number) => {
  const cid = Util.getCID(src);
  const availableRaces = [];
  for (let race of races.values()) {
    if (race.state === 'ending' || (race.kicked && race.kicked.includes(cid))) continue;
    availableRaces.push(race);
  }
  return availableRaces;
};

export const getRaceIdForPly = (src: number) => {
  const cid = Util.getCID(src);
  if (!cid) return;
  for (const race of races.values()) {
    if (race.participants.includes(cid)) {
      return race.id;
    }
  }
};

export const isRaceScheduled = (raceId: number) => {
  const race = races.get(raceId);
  return race?.state === 'pending';
};

export const isTrackInUse = (trackId: number) => {
  for (let race of races.values()) {
    if (race.trackId === trackId) {
      return true;
    }
  }
  return false;
};

export const scheduleRace = (
  src: number,
  trackId: number,
  startTime: string,
  classRestriction?: Vehicles.Class,
  forLeaderboard = false,
  laps?: number
) => {
  const plyRaceId = getRaceIdForPly(src);
  if (plyRaceId) {
    Notifications.add(src, 'Je zit al in een race');
    return;
  }
  let id = raceId++;
  const cid = Util.getCID(src);
  const track = getTrackById(trackId);
  if (!track) {
    Notifications.add(src, 'De gekozen racetrack bestaat niet', 'error');
    mainLogger.error(`Failed to retrieve track with id: ${trackId}`);
    return;
  }
  races.set(id, {
    id,
    trackId,
    leaderboard: forLeaderboard,
    classRestriction: forLeaderboard ? classRestriction : undefined,
    creator: cid,
    startTime: new Date(startTime).getTime(),
    participants: [],
    state: 'pending',
    laps: track.type === 'lap' ? laps ?? 1 : undefined,
  });
  Util.getAllPlayers().forEach(async ply => {
    if (ply === src) return;
    const amount = await Inventory.getAmountPlayerHas(ply, 'racing_stick');
    if (amount < 1) return;
    Phone.showNotification(ply, {
      id: `race_announcement_${raceId}`,
      title: 'Vroom Vroom',
      icon: 'racing',
      description: `A new race on ${track.name} has popped up`,
    });
  });
  joinRace(src, id);
  setTimeout(() => {
    const race = races.get(id);
    if (!race || race.state !== 'pending') {
      return;
    }
    stopRace(id);
  }, dayjs(startTime).add(30, 'minute').diff());
};

export const joinRace = async (src: number, raceId: number) => {
  const plyRaceId = getRaceIdForPly(src);
  if (plyRaceId) {
    Notifications.add(src, 'Je zit al in een race');
    return;
  }
  const race = races.get(raceId);
  if (!race) {
    Notifications.add(src, 'Je probeerde een niet bestaande race te joinen', 'error');
    return;
  }
  if (race.state !== 'pending') {
    Notifications.add(src, 'Deze race kun je niet meer joinen');
    return;
  }
  const cid = Util.getCID(src);
  if (race.participants.includes(cid)) {
    Notifications.add(src, 'Je zit al in de race', 'error');
    return;
  }
  race.participants.push(cid);

  setRaceAppState(src);

  const track = getTrackById(race.trackId);
  if (!track) {
    mainLogger.error(`Tried to join a race which is run on a non-existing track`, { trackId: race.trackId });
    return;
  }
  Events.emitNet('racing:race:joined', src, track.checkpoints);

  const ply = charModule.getPlayerByCitizenId(cid);
  if (!ply) {
    mainLogger.error(`Failed to retrieve player with cid: ${cid} for racing`);
    return;
  }
  const name = ply.metadata.racingAlias;
  for (const cid of race.participants) {
    const srvId = charModule.getServerIdFromCitizenId(cid);
    if (!srvId || srvId === src) return;
    Events.emitNet('racing:race:syncParticipant', srvId, { name, cid: ply.citizenid, srvId: src }, 'add');
  }
};

export const startRace = (src: number, raceId: number) => {
  const race = races.get(raceId);
  if (!race) {
    Notifications.add(src, 'Je probeerde een race te starten die niet bestaat');
    return;
  }
  const cid = Util.getCID(src);
  if (race.creator !== cid) {
    Admin.ACBan(src, `Starting a race that you didn't create`, { race });
    return;
  }
  const track = getTrackById(race.trackId);
  if (!track) return;

  const participantSrvIds: Record<number, number> = {};
  for (const participant of race.participants) {
    const srvId = charModule.getServerIdFromCitizenId(participant);
    if (!srvId) return;
    participantSrvIds[participant] = srvId;
  }

  // Do start checks
  if (race.leaderboard) {
    // if (race.participants.length < 3) {
    //   Phone.showNotification(src, {
    //     icon: 'racing',
    //     title: 'Failed to start race',
    //     id: 'race-start-error',
    //     description: 'Er moeten minstens 3 mensen deelnemen aan een tournament',
    //   });
    //   return
    // }
    if (race.classRestriction) {
      for (let srvId of Object.values(participantSrvIds)) {
        const ped = GetPlayerPed(String(srvId));
        const veh = GetVehiclePedIsIn(ped, false);
        const ply = Core.getPlayer(srvId);
        if (!ply) continue;
        if (!veh) {
          Phone.showNotification(src, {
            icon: 'racing',
            title: 'Failed to start race',
            id: 'race-start-error',
            description: `${ply?.metadata.racingAlias} zit niet in een voertuig`,
          });
          return;
        }
        if (GetPedInVehicleSeat(veh, -1) !== ped) {
          Phone.showNotification(src, {
            icon: 'racing',
            title: 'Failed to start race',
            id: 'race-start-error',
            description: `${ply?.metadata.racingAlias} is niet de bestuurder van een voertuig`,
          });
          return;
        }
        const vehConfig = Vehicles.getConfigByEntity(veh);
        if (!vehConfig) {
          Phone.showNotification(src, {
            icon: 'racing',
            title: 'Failed to start race',
            id: 'race-start-error',
            description: `${ply?.metadata.racingAlias} zit in niet-racebaar voertuig`,
          });
          return;
        }
        if (vehConfig.class !== race.classRestriction) {
          Phone.showNotification(src, {
            icon: 'racing',
            title: 'Failed to start race',
            id: 'race-start-error',
            description: `${ply?.metadata.racingAlias} zit in voertuig van andere klasse (${vehConfig.class})`,
          });
          return;
        }
      }
    }
  }

  race.state = 'running';
  const raceInfo: Racing.RunningRaceState = {
    leaderboard: [],
    passedPoints: {},
    disqualified: [],
    finishers: [],
    dnfTimer: null,
  };
  runningRaces.set(raceId, raceInfo);

  let highestPing = 0;
  for (const participant of race.participants) {
    const srvId = charModule.getServerIdFromCitizenId(participant);
    if (!srvId) return;
    const ping = GetPlayerPing(String(srvId));
    if (highestPing < ping) {
      highestPing = ping;
    }
  }
  const startTime = dayjs().add(5, 's');
  mainLogger.debug(
    `Schedule race ${race.id} on ${race.trackId} to start on: ${startTime.format(
      'YYYY-MM-DD HH:mm:ss:SSS'
    )}(${startTime.diff(dayjs())})`
  );
  race.startTime = +startTime;

  const clientState = generateClientState(raceId);
  if (!clientState) return;
  Object.values(participantSrvIds).forEach(id => {
    Events.emitNet('racing:race:syncRaceStateApp', id, { state: race.state });
    Events.emitNet('racing:race:start', id, +startTime, track.checkpoints, clientState);
  });
  // do a first leaderboard calculation based on the dist from start
  raceInfo.leaderboard = Object.keys(participantSrvIds)
    .sort((a, b) => {
      const cid1 = Number(a);
      const cid2 = Number(b);
      const aPed = GetPlayerPed(String(participantSrvIds[cid1]));
      const bPed = GetPlayerPed(String(participantSrvIds[cid2]));
      const aVeh = GetVehiclePedIsIn(aPed, false);
      const bVeh = GetVehiclePedIsIn(bPed, false);
      if (!aVeh && !bVeh) {
        return 0;
      }
      if (!aVeh) {
        return 1;
      }
      if (!bVeh) {
        return -1;
      }
      const startPoint = track.checkpoints[0];
      if (!startPoint) return 0;
      const aPos = Util.getEntityCoords(aVeh);
      const bPos = Util.getEntityCoords(bVeh);
      return aPos.distance(startPoint.center) - bPos.distance(startPoint.center);
    })
    .map(e => Number(e));
  syncLeaderboard(raceId);
  Util.Log(
    'racing:race:start',
    {
      race,
    },
    `${Util.getIdentifier(src)} has started a race on ${track.name}`,
    src
  );
};

export const passedCheckpoint = (src: number, raceId: number, checkpoint: number) => {
  const race = races.get(raceId);
  if (!race) {
    mainLogger.error(`${Util.getName(src)}(${src}) tried to pass a checkpoint of a non-running race`);
    return;
  }
  const raceState = runningRaces.get(raceId);
  const track = getTrackById(race.trackId);
  if (!raceState || !track) {
    mainLogger.error(`${Util.getName(src)}(${src}) tried to pass a checkpoint of a race with missing data`);
    return;
  }
  const cid = Util.getCID(src);
  if (!raceState.passedPoints[cid]) {
    raceState.passedPoints[cid] = [];
  }
  let lap = 1;
  if (race.laps) {
    // next lap
    if (checkpoint === 0) {
      if (raceState.passedPoints[cid][lap] !== undefined) {
        while (raceState.passedPoints[cid][lap] !== undefined || lap === race.laps) {
          lap++;
        }
      }
    } else {
      lap = Object.keys(raceState.passedPoints[cid]).length;
    }
  }
  if (!raceState.passedPoints[cid][lap]) {
    raceState.passedPoints[cid][lap] = [];
  }

  // Prevent the process from getting stuck if you mis a checkpoint event
  if (raceState.passedPoints[cid][lap].length + 1 < checkpoint) {
    return;
  }
  raceState.passedPoints[cid][lap][checkpoint] = Date.now();
  if (lap > 1 && checkpoint === 0) {
    let bestLapTime = calculateBestLap(cid, raceId);
    Events.emitNet('racing:race:setBestLap', src, bestLapTime);
  }
  calculateLeaderboard(raceId);
  syncLeaderboard(raceId);
};

export const finishRace = (src: number, raceId: number) => {
  const race = races.get(raceId);
  const cid = Util.getCID(src);
  const raceState = runningRaces.get(raceId);
  if (!race || !raceState || !race?.participants.includes(cid) || race.state !== 'running') {
    return;
  }
  raceState.finishers.push(cid);
  const veh = GetVehiclePedIsIn(GetPlayerPed(String(src)), false);
  if (!veh) {
    mainLogger.warn(`${Util.getIdentifier(src)} has finished without car`);
    return;
  }
  const vehConfig = Vehicles.getConfigByEntity(veh);
  if (race.leaderboard && (!vehConfig || race.classRestriction !== vehConfig?.class)) {
    Phone.showNotification(src, {
      icon: 'racing',
      title: 'Disqualified',
      id: 'race-finish-error',
      description: 'Je hebt de race gefinished in een voertuig van een andere klasse',
    });
    raceState.disqualified.push(cid);
  }
  Util.Log(
    'racing:race:finish',
    {
      id: race.id,
      trackId: race.trackId,
      times: raceState.passedPoints[cid],
    },
    `${Util.getIdentifier(src)} has finished in a race`,
    src
  );
  if (race.participants.length === raceState.finishers.length) {
    stopRace(raceId);
    return;
  }
  if (race.participants.length * 0.75 >= raceState.finishers.length) {
    // Start dnf timer
    const dnfTimeout = dayjs().add(2, 'm');
    raceState.dnfTimer = setTimeout(
      () => {
        stopRace(raceId);
      },
      2 * 60 * 1000
    );
    for (const cid of race.participants) {
      if (raceState.finishers.includes(cid)) continue;
      const srvId = charModule.getServerIdFromCitizenId(cid);
      if (!srvId) return;
      Events.emitNet('racing:race:startDnfTimer', srvId, +dnfTimeout);
    }
  }
};

export const leaveRace = (cid: number, raceId: number) => {
  const race = races.get(raceId);
  if (!race) return;
  if (!race.participants.includes(cid)) {
    return;
  }
  const idx = race.participants.findIndex(e => e === cid);
  if (idx < 0) return;
  race.participants.splice(idx, 1);

  const srvId = charModule.getServerIdFromCitizenId(cid);

  Util.Log(
    `racing:race:left`,
    {
      cid,
      raceId,
    },
    `${cid} has left the race with id: ${raceId}`,
    srvId
  );

  if (srvId) {
    Phone.showNotification(srvId, {
      id: 'race-leave-notice',
      icon: 'racing',
      title: 'Racing',
      description: 'Race verlaten',
    });
    Events.emitNet('racing:race:syncRaceApp', srvId, undefined);
    Events.emitNet('racing:race:cleanupRace', srvId, true);
  }

  if (race.participants.length === 0) {
    stopRace(raceId);
    return;
  }

  race.participants.forEach(pCid => {
    const srvId = charModule.getServerIdFromCitizenId(pCid);
    if (!srvId) return;
    Events.emitNet('racing:race:syncParticipant', srvId, { cid }, 'remove');
  });
};

export const cancelRace = (src: number, raceId: number) => {
  const cid = Util.getCID(src);
  const race = races.get(raceId);
  if (!race) return;
  if (race.creator !== cid) {
    Admin.ACBan(src, `tries to cancel a race you didn't start`, { raceId });
    return;
  }
  if (race.state === 'ending') {
    leaveRace(cid, raceId);
    return;
  }
  runningRaces.delete(raceId);

  const track = getTrackById(race.trackId);

  for (const participant of race.participants) {
    const srvId = charModule.getServerIdFromCitizenId(participant);
    if (!srvId) return;
    Phone.showNotification(srvId, {
      id: 'race-cancel-notice',
      icon: 'racing',
      title: 'Race cancelled',
      description: `De race op ${track?.name ?? 'een track'} is geannuleerd door de host`,
    });
    Events.emitNet('racing:race:syncRaceApp', srvId, undefined);
    Events.emitNet('racing:race:cleanupRace', srvId, true);
  }

  races.delete(raceId);
  Util.Log(
    `racing:race:canceled`,
    {
      raceId: race.id,
    },
    `${Util.getIdentifier(src)} has canceled a race`,
    src
  );
};

export const rejoinRace = (src: number) => {
  const cid = Util.getCID(src);
  let plyRace: Racing.RaceState | null = null;
  for (let race of races.values()) {
    if (race.participants.includes(cid)) {
      plyRace = race;
    }
  }

  if (!plyRace || plyRace.state === 'pending') {
    return;
  }
  const runningRace = runningRaces.get(plyRace.id);
  const track = getTrackById(plyRace.trackId);

  const clientState = generateClientState(plyRace.id);
  if (!clientState || !runningRace || !track) return;
  if (!runningRace.disqualified.includes(cid)) return;

  const lap = Object.keys(runningRace.passedPoints[cid])?.length ?? 0;
  Events.emitNet('racing:race:syncRaceStateApp', src, { state: plyRace.state });
  Events.emitNet(
    'racing:race:rejoin',
    src,
    clientState,
    track.checkpoints,
    lap,
    runningRace.passedPoints[cid][lap]?.length ?? 0
  );
  calculateLeaderboard(plyRace.id);
  syncLeaderboard(plyRace.id);
};

export const kickRace = (src: number, raceId: number, target: number) => {
  if (!hasDongle) {
    Admin.ACBan(src, `Tried race action without dongle`);
    return;
  }
  const race = races.get(raceId);
  const cid = Util.getCID(src);
  if (!race || race.creator !== cid) return;
  if (!race.kicked) {
    race.kicked = [];
  }
  race.kicked.includes(target);

  Util.Log(
    'racing:race:kick',
    {
      raceId: race.id,
      target,
    },
    `${Util.getIdentifier(src)} has kicked ${target} from his race`,
    src
  );

  leaveRace(target, raceId);
};
