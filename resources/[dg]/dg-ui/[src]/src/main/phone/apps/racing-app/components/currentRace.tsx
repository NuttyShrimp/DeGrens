import { useMemo } from 'react';
import { MdOutlineTimer } from 'react-icons/md';
import { TiArrowLoop } from 'react-icons/ti';
import { Divider } from '@mui/material';
import { Button } from '@src/components/button';
import { Icon } from '@src/components/icon';
import { List } from '@src/components/list';
import { nuiAction } from '@src/lib/nui-comms';
import { useMainStore } from '@src/lib/stores/useMainStore';
import { formatRelativeTime } from '@src/lib/util';
import { showCheckmarkModal, showLoadModal } from '@src/main/phone/lib';

import { useRacingAppStore } from '../stores/racingAppStore';

export const CurrentRace = () => {
  const [race, tracks] = useRacingAppStore(s => [s.selectedRace, s.tracks]);
  const track = useMemo(() => tracks.find(t => t.id === race?.trackId), [race, tracks]);
  const [character] = useMainStore(s => [s.character]);

  const participants = useMemo(() => {
    if (!race) return [];
    const participants = [...race.participants];
    if (race.leaderboardData) {
      participants.sort((a, b) => race.leaderboardData![a.cid] - race.leaderboardData![b.cid]);
    }
    return participants.map(p => ({
      label: race.prize ? (
        <p>
          {p.name}
          <span>
            <Icon name={'mdi-alpha-s'} />
            {race.prize[p.cid] ?? 0}
          </span>
        </p>
      ) : (
        p.name
      ),
      icon: p.cid === race.creator ? 'crown' : 'empty',
      onClick: (cid: number) => {
        if (cid === character.cid) return;
        nuiAction('phone/racing/kick', { cid, raceId: race.id });
      },
      data: p.cid,
    }));
  }, [race]);

  if (!track || !race) {
    return null;
  }

  const leaveRace = async () => {
    showLoadModal();
    await nuiAction('phone/racing/race/leave', { raceId: race.id });
    showCheckmarkModal();
  };

  const cancelRace = async () => {
    showLoadModal();
    await nuiAction('phone/racing/race/cancel', { raceId: race.id });
    showCheckmarkModal();
  };

  const startRace = async () => {
    showLoadModal();
    await nuiAction('phone/racing/race/start', { raceId: race.id });
    showCheckmarkModal();
  };

  return (
    <div className='racing-app-current-container'>
      <div className='racing-app-current-title'>
        {track.type === 'sprint' ? <MdOutlineTimer size={'2rem'} /> : <TiArrowLoop size={'2rem'} />}
        <p>{track.name}</p>
      </div>
      <Divider />
      {race.state === 'pending' && (
        <>
          <div>
            <p>starting: {formatRelativeTime(race.startTime)}</p>
          </div>
          <Divider />
        </>
      )}
      <List items={participants} />
      <div className='racing-app-current-actions'>
        {race.creator === character.cid ? (
          <>
            {race.state === 'pending' && <Button.Primary onClick={startRace}>Start race</Button.Primary>}
            <Button.Secondary onClick={cancelRace}>Cancel race</Button.Secondary>
          </>
        ) : (
          <Button.Primary onClick={leaveRace}>Leave Race</Button.Primary>
        )}
      </div>
    </div>
  );
};
