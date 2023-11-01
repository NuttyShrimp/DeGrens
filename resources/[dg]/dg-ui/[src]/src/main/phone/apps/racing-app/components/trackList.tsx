import { useCallback, useEffect, useState } from 'react';
import { MdOutlineTimer } from 'react-icons/md';
import { TiArrowLoop } from 'react-icons/ti';
import { Button } from '@src/components/button';
import { Paper } from '@src/components/paper';
import { nuiAction } from '@src/lib/nui-comms';
import { useMainStore } from '@src/lib/stores/useMainStore';
import { showFormModal } from '@src/main/phone/lib';

import { loadTracks } from '../lib';
import { useRacingAppStore } from '../stores/racingAppStore';

import { RaceCreationModal } from './modals/raceCreationModal';
import { TrackCreationModal } from './modals/trackCreationModal';
import { Leaderboard } from './leaderboard';

export const TrackList = () => {
  const [tracks, canCreateTrack] = useRacingAppStore(s => [s.tracks, s.canCreateTrack]);
  const [character] = useMainStore(s => [s.character]);
  const [leaderboard, setShowLeaderboard] = useState<number>(0);

  useEffect(() => {
    // Load tracks into cache
    loadTracks();
  }, []);

  const generateActions = useCallback(
    (trackId: number, trackCreator: number, multiLap: boolean) => {
      const actions = [
        {
          title: 'Create race',
          icon: 'circle-plus',
          onClick: () => {
            showFormModal(<RaceCreationModal trackId={trackId} multiLap={multiLap} />);
          },
        },
        {
          title: 'Preview',
          icon: 'eye',
          onClick: () => {
            nuiAction('phone/racing/track/preview', { trackId: trackId });
          },
        },
        {
          title: 'Leaderboard',
          icon: 'medal',
          onClick: () => {
            setShowLeaderboard(trackId);
          },
        },
      ];
      if (trackCreator === character.cid) {
        actions.push(
          {
            title: 'Edit',
            icon: 'pencil',
            onClick: () => {
              nuiAction('phone/racing/track/edit', { trackId: trackId });
            },
          },
          {
            title: 'Delete',
            icon: 'trash',
            onClick: () => {
              nuiAction('phone/racing/track/delete', { trackId: trackId });
            },
          }
        );
      }
      return actions;
    },
    [character]
  );

  return leaderboard ? (
    <Leaderboard goBack={() => setShowLeaderboard(0)} trackId={leaderboard} />
  ) : (
    <div className='racing-app-list'>
      {canCreateTrack && (
        <div className='center' style={{ marginBottom: '1vh' }}>
          <Button.Primary
            onClick={() => {
              showFormModal(<TrackCreationModal />);
            }}
          >
            Create track
          </Button.Primary>
        </div>
      )}
      {tracks.length === 0 && (
        <div className='center'>
          <p>There are currently no race tracks :(</p>
        </div>
      )}
      {tracks.map(track => (
        <Paper
          key={track.id}
          title={track.name}
          description={`${track.checkpoint} checkpoints`}
          image={track.type === 'sprint' ? <MdOutlineTimer /> : <TiArrowLoop />}
          actions={generateActions(track.id, track.creator, track.type === 'lap')}
        />
      ))}
    </div>
  );
};
