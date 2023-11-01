import { formatTimeMS } from '@src/lib/util';

import { useRacingAppStore } from '../stores/useRacingAppStore';

export const RaceTimer = (props: { timer: string; totalTimer: string; dnfTimer?: string; frozen: boolean }) => {
  const [best, currentCheckpoint, position, currentLap, totalCheckpoints, totalParticipants, totalLaps] =
    useRacingAppStore(s => [
      s.bestLap,
      s.checkpoint,
      s.position,
      s.currentLap,
      s.totalCheckpoints,
      s.totalParticipants,
      s.totalLaps,
    ]);

  return (
    <div className='racing-timer-container'>
      <div className='racing-timer-title racing-timer-text' style={{ color: props.frozen ? 'forestgreen' : 'white' }}>
        <p>Pos</p>
        <p>
          {position}/{totalParticipants}
        </p>
      </div>
      {!props.frozen && (
        <>
          {totalLaps > 1 && (
            <div className='racing-timer-title racing-timer-text'>
              <p>Lap</p>
              <p>
                {currentLap}/{totalLaps}
              </p>
            </div>
          )}
          <div className='racing-timer-title racing-timer-text'>
            <p>Checkpoint</p>
            <p>
              {currentCheckpoint}/{totalCheckpoints}
            </p>
          </div>
        </>
      )}
      <div className='racing-timer-additional racing-timer-text'>
        <p>Current Lap</p>
        <p>{props.timer}</p>
      </div>
      <div className='racing-timer-additional racing-timer-text'>
        <p>Best Lap</p>
        <p>{formatTimeMS(best)}</p>
      </div>
      <div className='racing-timer-additional racing-timer-text'>
        <p>Total Time</p>
        <p>{props.totalTimer}</p>
      </div>
      {props.dnfTimer && (
        <div className='racing-timer-additional racing-timer-text'>
          <p>DNF</p>
          <p>{props.dnfTimer}</p>
        </div>
      )}
    </div>
  );
};
