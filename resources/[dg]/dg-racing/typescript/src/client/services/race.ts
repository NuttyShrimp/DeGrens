import { Events, Notifications, UI, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { FLAG_HASH_KEY, PILE_HASH_KEY } from 'constant';
import { doLinesIntersect, getCheckpointObjectCoords } from 'helpers/utils';

import { clearBlips, showRaceBlips } from './blips';
import { initGhostProcess, stopGhostProcess } from './ghosting';

const currentRace: {
  checkpoints: Racing.Checkpoint[];
  positionThread: number;
  startTime: number;
  position: number;
  checkpoint: number;
  lap: number;
  prevCoords: Vec3;
  race: Racing.ClientRaceState | null;
} = {
  checkpoints: [],
  positionThread: 0,
  startTime: 0,
  position: 0,
  checkpoint: 0,
  lap: 1,
  prevCoords: new Vector3(0, 0, 0),
  race: null,
};
let timerReset: NodeJS.Timer | null = null;

const passedCheckpoint = (coords: Vec3) => {
  const checkpoint = currentRace.checkpoints[currentRace.checkpoint];
  if (!checkpoint) return false;
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);
  if (!veh) return false;
  if (GetPedInVehicleSeat(veh, -1) !== ped) return false;

  // Get coords for entities
  const [leftCheckpoint, rightCheckpoint] = getCheckpointObjectCoords(checkpoint.center, checkpoint.spread);

  if (Util.isDevEnv()) {
    DrawLine(
      leftCheckpoint.x,
      leftCheckpoint.y,
      leftCheckpoint.z,
      rightCheckpoint.x,
      rightCheckpoint.y,
      rightCheckpoint.z,
      0,
      255,
      0,
      255
    );
  }

  return doLinesIntersect(leftCheckpoint, rightCheckpoint, currentRace.prevCoords, coords);
};

const startRaceThread = () => {
  if (!currentRace.race) return;
  if (currentRace.positionThread) {
    clearTick(currentRace.positionThread);
  }
  UI.SendAppEvent('racing', {
    action: 'setTimerInfo',
    data: {
      position: 1,
      currentLap: 1,
      checkpoint: 0,
      totalLaps: currentRace.race?.laps ?? 1,
      totalParticipants: Object.keys(currentRace.race?.participants ?? {}).length,
      totalCheckpoints: currentRace.checkpoints.length,
    },
  });

  const veh = GetVehiclePedIsIn(PlayerPedId(), false);
  if (veh) {
    FreezeEntityPosition(veh, false);
  }

  showRaceBlips(currentRace.checkpoints, currentRace.checkpoint, currentRace.lap > 1);

  let timerStarted = false;
  currentRace.positionThread = setTick(() => {
    const coords = Util.getPlyCoords();
    if (passedCheckpoint(coords)) {
      if (!timerStarted) {
        timerStarted = true;
        UI.SendAppEvent('racing', {
          action: 'startTimer',
        });
      }
      currentRace.checkpoint++;
      if (currentRace.checkpoint >= currentRace.checkpoints.length) {
        // sprint race at finish
        if (!currentRace.race?.laps || currentRace.lap >= currentRace.race.laps) {
          Events.emitNet('racing:races:passCheckpoint', currentRace.race?.laps ? 0 : currentRace.checkpoint - 1);
          UI.SendAppEvent('racing', {
            action: 'freezeTimer',
            data: {},
          });
          PlaySoundFrontend(-1, 'Oneshot_Final', 'MP_MISSION_COUNTDOWN_SOUNDSET', false);
          Events.emitNet('racing:race:finish', currentRace.race?.id);
          clearTick(currentRace.positionThread);
          currentRace.positionThread = 0;
          return;
        }
        currentRace.checkpoint = 1;
        currentRace.lap++;
        UI.SendAppEvent('racing', {
          action: 'lapPassed',
          data: {},
        });
        UI.SendAppEvent('racing', {
          action: 'setTimerInfo',
          data: {
            currentLap: currentRace.lap,
            checkpoint: currentRace.checkpoint,
          },
        });
      } else {
        UI.SendAppEvent('racing', {
          action: 'setTimerInfo',
          data: {
            checkpoint: currentRace.checkpoint,
          },
        });
      }
      Events.emitNet('racing:races:passCheckpoint', currentRace.checkpoint - 1);
      showRaceBlips(currentRace.checkpoints, currentRace.checkpoint, currentRace.lap > 1);
    }
    currentRace.prevCoords = coords;
  });
};

const doStartCountdown = async (untilStart: number) => {
  const overTime = untilStart % 1000;
  let countDownSec = Math.floor(untilStart / 1000);
  Util.debug(`until: ${untilStart}, overTime: ${overTime}, countDownSec: ${countDownSec}`);
  if (overTime > 0) {
    UI.SendAppEvent('racing', {
      countDown: countDownSec + 1,
      action: 'startCountdown',
    });
    PlaySoundFrontend(-1, 'Beep_Red', 'DLC_HEIST_HACKING_SNAKE_SOUNDS', false);
    await Util.Delay(overTime);
  }
  if (countDownSec <= 0) {
    PlaySoundFrontend(-1, 'Oneshot_Final', 'MP_MISSION_COUNTDOWN_SOUNDSET', false);
    return;
  }
  UI.SendAppEvent('racing', {
    countDown: countDownSec,
    action: 'startCountdown',
  });
  PlaySoundFrontend(-1, 'Beep_Red', 'DLC_HEIST_HACKING_SNAKE_SOUNDS', false);
  const countdown = setInterval(() => {
    countDownSec--;
    if (countDownSec <= 0) {
      PlaySoundFrontend(-1, 'Oneshot_Final', 'MP_MISSION_COUNTDOWN_SOUNDSET', false);
      clearInterval(countdown);
    } else {
      PlaySoundFrontend(-1, 'Beep_Red', 'DLC_HEIST_HACKING_SNAKE_SOUNDS', false);
    }
    UI.SendAppEvent('racing', {
      countDown: countDownSec,
      action: 'startCountdown',
    });
  }, 1000);
};

const placeCheckpointObjects = () => {
  currentRace.checkpoints.forEach((checkpoint, i) => {
    if (i === currentRace.checkpoints.length - 1 && currentRace.race?.laps) return;
    const [leftCheckpoint, rightCheckpoint] = getCheckpointObjectCoords(checkpoint.center, checkpoint.spread);
    let objHash = PILE_HASH_KEY;
    if (i === 0) {
      objHash = FLAG_HASH_KEY;
    } else if (i === currentRace.checkpoints.length - 1 && (currentRace.race?.laps ?? 1) > 1) {
      objHash = FLAG_HASH_KEY;
    }
    let leftCheckpointObject = checkpoint.entities?.left;
    let rightCheckpointObject = checkpoint.entities?.right;
    if (!checkpoint.entities?.left) {
      leftCheckpointObject = CreateObject(
        objHash,
        leftCheckpoint.x,
        leftCheckpoint.y,
        leftCheckpoint.z,
        false,
        false,
        false
      );
      SetEntityHeading(leftCheckpointObject, checkpoint.center.w);
      PlaceObjectOnGroundProperly(leftCheckpointObject);
    }
    if (!checkpoint.entities?.right) {
      rightCheckpointObject = CreateObject(
        objHash,
        rightCheckpoint.x,
        rightCheckpoint.y,
        rightCheckpoint.z,
        false,
        false,
        false
      );
      SetEntityHeading(rightCheckpointObject, checkpoint.center.w);
      PlaceObjectOnGroundProperly(rightCheckpointObject);
    }
    checkpoint.entities = {
      left: leftCheckpointObject!,
      right: rightCheckpointObject!,
    };
  });
};

const cleanupCheckpointObjects = () => {
  for (const checkpoint of currentRace.checkpoints) {
    if (!checkpoint.entities) return;
    DeleteEntity(checkpoint.entities.left);
    DeleteEntity(checkpoint.entities.right);
  }
};

export const joinedRace = (checkpoints: Racing.Checkpoint[]) => {
  currentRace.checkpoints = checkpoints;
  placeCheckpointObjects();
  showRaceBlips(currentRace.checkpoints, currentRace.checkpoint, currentRace.lap > 1);
};

export const scheduleRaceStart = (
  startTime: number,
  checkpoints: Racing.Checkpoint[],
  race: Racing.ClientRaceState
) => {
  currentRace.race = race;
  if (currentRace.race.laps) {
    currentRace.checkpoints.push(checkpoints[0]);
  }
  currentRace.checkpoint = 0;
  // Based on a roughly calculated time when the event got emitted, + the countdown time
  currentRace.startTime = startTime + 5000;
  currentRace.prevCoords = Util.getPlyCoords();

  const veh = GetVehiclePedIsIn(PlayerPedId(), false);
  if (veh) {
    FreezeEntityPosition(veh, true);
  }

  initGhostProcess(currentRace.race);

  setTimeout(() => {
    if (!currentRace.positionThread) return;
    stopGhostProcess();
    Notifications.add('Ghosting is nu uitgeschakeld');
  }, 60000);

  if (timerReset) {
    clearTimeout(timerReset);
    timerReset = null;
  }
  UI.SendAppEvent('racing', {
    action: 'resetTimer',
  });

  // missed the start time, start countdown on the next second
  if (currentRace.startTime < Date.now()) {
    // Start race instantly
    startRaceThread();
    return;
  }

  const timeUntilStart = currentRace.startTime - Date.now();
  setTimeout(() => {
    startRaceThread();
  }, timeUntilStart);

  doStartCountdown(timeUntilStart);
  return;
};

export const setPosition = (position: number) => {
  currentRace.position = position;
  UI.SendAppEvent('racing', {
    action: 'setTimerInfo',
    data: {
      position,
    },
  });
};

export const cleanupRace = async (canceled = false) => {
  // Is the startTime set but the posThread not started? Wait
  if (currentRace.startTime && canceled && !currentRace.positionThread) {
    Notifications.add('You will leave the race AFTER the countdown');
    await Util.awaitCondition(() => currentRace.positionThread !== 0);
  }
  cleanupCheckpointObjects();
  clearBlips();
  currentRace.checkpoints = [];
  currentRace.checkpoint = 0;
  currentRace.position = 0;
  currentRace.lap = 1;
  currentRace.startTime = 0;
  currentRace.prevCoords = new Vector3(0, 0, 0);
  currentRace.race = null;
  if (currentRace.positionThread) {
    clearTick(currentRace.positionThread);
  }
  currentRace.positionThread = 0;
  stopGhostProcess();
  if (!canceled) {
    UI.SendAppEvent('racing', {
      action: 'freezeTimer',
      data: {},
    });
    timerReset = setTimeout(() => {
      UI.SendAppEvent('racing', {
        action: 'resetTimer',
      });
    }, 30 * 1000);
  } else {
    UI.SendAppEvent('racing', {
      action: 'resetTimer',
    });
  }
};

export const syncParticipant = (
  participant: { name: string; cid: number; srvId: number },
  action: 'remove' | 'add'
) => {
  if (!currentRace.race) {
    console.error('Failed to sync participant because not in a race');
    return;
  }

  if (action === 'add') {
    currentRace.race.participants[participant.cid] = participant.srvId;
  } else {
    delete currentRace.race.participants[participant.cid];
  }

  if (!currentRace.positionThread) return;

  UI.SendAppEvent('racing', {
    action: 'setTimerInfo',
    data: {
      totalParticipants: Object.keys(currentRace.race.participants).length,
    },
  });
};

export const rejoinRace = (
  race: Racing.ClientRaceState,
  checkpoints: Racing.Checkpoint[],
  lap: number,
  checkpoint: number
) => {
  currentRace.checkpoints = checkpoints;
  currentRace.checkpoint = checkpoint;
  currentRace.lap = lap;
  currentRace.race = race;
  currentRace.position = Object.keys(race.participants).length;
  currentRace.startTime = race.startTime;

  UI.SendAppEvent('racing', {
    action: 'resetTimer',
  });

  placeCheckpointObjects();
  startRaceThread();
};

export const reloadUI = async () => {
  if (currentRace.race) {
    await Util.awaitCondition(() => currentRace.positionThread !== 0);
    UI.SendAppEvent('racing', {
      action: 'startTimer',
      startTime: +currentRace.startTime!,
    });
    UI.SendAppEvent('racing', {
      action: 'setTimerInfo',
      data: {
        position: 1,
        currentLap: 1,
        checkpoint: 0,
        totalLaps: currentRace.race?.laps ?? 1,
        totalParticipants: Object.keys(currentRace.race?.participants ?? {}).length,
        totalCheckpoints: currentRace.checkpoints.length,
      },
    });
  } else {
    Events.emitNet('racing:race:syncRaceAppState');
  }
};
