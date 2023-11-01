import { Events, UI } from '@dgx/client';
import { clearBlips, showBlipsForCheckpoints, showingBlips } from 'services/blips';
import { startTrackCreator } from 'services/creator';
import { cleanupRace, joinedRace, rejoinRace, scheduleRaceStart, setPosition, syncParticipant } from 'services/race';

Events.onNet('racing:creator:start', (id: number, checkpoints?: Racing.Checkpoint[]) => {
  startTrackCreator(id, checkpoints);
});

Events.onNet('racing:track:preview', (checkpoints: Racing.Checkpoint[], lapped: boolean) => {
  if (showingBlips()) {
    clearBlips();
  } else {
    showBlipsForCheckpoints(checkpoints, lapped);
  }
});

Events.onNet('racing:track:canCreate', (canCreate: boolean) => {
  UI.SendAppEvent('phone', {
    appName: 'racing',
    action: 'toggleCreate',
    data: canCreate,
  });
});

Events.onNet('racing:track:canSeeApp', (canSee: boolean) => {
  UI.SendAppEvent('phone', {
    action: 'toggleApp',
    appName: 'racing',
    data: canSee,
  });
});

Events.onNet('racing:race:joined', (checkpoints: Racing.Checkpoint[]) => {
  joinedRace(checkpoints);
});

Events.onNet(
  'racing:race:start',
  (startTime: number, checkpoints: Racing.Checkpoint[], race: Racing.ClientRaceState) => {
    scheduleRaceStart(startTime, checkpoints, race);
  }
);

Events.onNet('racing:race:setPosition', (position: number) => {
  setPosition(position);
});

Events.onNet('racing:race:setBestLap', (bestLap: number) => {
  UI.SendAppEvent('racing', {
    action: 'setTimerInfo',
    data: {
      bestLap,
    },
  });
});

Events.onNet('racing:race:startDnfTimer', (dnfTimer: number) => {
  UI.SendAppEvent('racing', {
    action: 'setDnfTimer',
    data: {
      dnfTimer,
    },
  });
});

Events.onNet('racing:race:cleanupRace', (canceled: boolean) => {
  cleanupRace(canceled);
});

Events.onNet('racing:race:syncRaceApp', (race: Racing.AppRaceState) => {
  UI.SendAppEvent('phone', {
    appName: 'racing',
    action: 'setRace',
    data: race,
  });
});

Events.onNet('racing:race:syncRaceStateApp', (state: Partial<Racing.RaceState>) => {
  UI.SendAppEvent('phone', {
    appName: 'racing',
    action: 'setRaceState',
    data: state,
  });
});

Events.onNet(
  'racing:race:syncParticipant',
  (participant: { name: string; cid: number; srvId: number }, action: 'remove' | 'add') => {
    syncParticipant(participant, action);
    UI.SendAppEvent('phone', {
      appName: 'racing',
      action: 'syncRaceParticipant',
      data: {
        participant,
        action,
      },
    });
  }
);

Events.onNet(
  'racing:race:rejoin',
  (state: Racing.ClientRaceState, checkpoints: Racing.Checkpoint[], lap: number, checkpoint: number) => {
    rejoinRace(state, checkpoints, lap, checkpoint);
  }
);

Events.onNet('racing:race:syncRacePrize', (prizes: Record<number, number>) => {
  UI.SendAppEvent('phone', {
    appName: 'racing',
    action: 'syncRacePrize',
    data: prizes,
  });
});
