import { useEffect, useMemo, useState } from 'react';
import { TiArrowLoop } from 'react-icons/ti';
import { Divider, Typography } from '@mui/material';
import { Button } from '@src/components/button';
import { Icon } from '@src/components/icon';
import { List } from '@src/components/list';
import { Paper } from '@src/components/paper';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { formatRelativeTime } from '@src/lib/util';

import { loadTracks } from '../lib';
import { useRacingAppStore } from '../stores/racingAppStore';

const RacePaper = ({ race }: { race: Phone.Racing.Race }) => {
  const [tracks] = useRacingAppStore(s => [s.tracks]);
  const track = useMemo(() => tracks.find(t => t.id === race.trackId), [race.trackId, tracks]);

  return (
    <Paper
      title={track?.name ?? 'Unknown track'}
      description={
        <div className='racing-app-pending-race-description'>
          <p>
            {race.leaderboard ? 'Tournament' : 'Fun Run'}
            {race.classRestriction ? ` | ${race.classRestriction}` : ''}
          </p>
          <div className='racing-app-pending-race-short-info'>
            {race?.laps && (
              <p style={{ marginRight: '.5vh' }}>
                <span>
                  <TiArrowLoop size='1.5rem' style={{ marginRight: '.2vh' }} />
                </span>{' '}
                {race.laps}
              </p>
            )}
            <p>
              <Icon size='1.3rem' name={'users'} style={{ marginRight: '.5vh' }} /> {race.participants.length}
            </p>
          </div>
        </div>
      }
      extDescription={
        <div>
          <Divider />
          <p style={{ paddingLeft: '.5vh' }}>starting: {formatRelativeTime(race.startTime)}</p>
          <Divider />
          <List
            items={race.participants.map(p => ({
              label: p.name,
            }))}
            textSize='.8rem'
          />
          <div className='center' style={{ marginTop: '1vh' }}>
            <Button.Primary
              onClick={e => {
                e.stopPropagation();
                nuiAction('phone/racing/race/join', { raceId: race.id });
              }}
            >
              Join
            </Button.Primary>
          </div>
        </div>
      }
    />
  );
};

export const RaceList = () => {
  const [pendingRaces, setPendingRaces] = useState<Phone.Racing.Race[]>([]);

  const fetchPendingRaces = async () => {
    await loadTracks();
    const races = await nuiAction('phone/racing/pending', undefined, devData.pendingRaces);
    setPendingRaces(races ?? []);
  };

  const availableRaces = useMemo(() => pendingRaces.filter(r => r.state === 'pending'), [pendingRaces]);
  const runningRaces = useMemo(() => pendingRaces.filter(r => r.state === 'running'), [pendingRaces]);

  useEffect(() => {
    fetchPendingRaces();
  }, []);

  return (
    <div className='racing-app-list'>
      {pendingRaces.length === 0 && (
        <div className='center'>
          <p>There are currently no races planned or going on :(</p>
        </div>
      )}
      {availableRaces.length > 0 && (
        <>
          <Typography variant='subtitle1'>Available</Typography>
          {availableRaces.map(race => (
            <RacePaper key={race.id} race={race} />
          ))}
        </>
      )}
      {runningRaces.length > 0 && (
        <>
          <Typography variant='subtitle1'>Running</Typography>
          {runningRaces.map(race => (
            <RacePaper key={race.id} race={race} />
          ))}
        </>
      )}
    </div>
  );
};
