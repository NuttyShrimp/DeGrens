import { useEffect, useState } from 'react';
import { Divider } from '@mui/material';
import { Icon } from '@src/components/icon';
import { Tooltip } from '@src/components/tooltip';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { formatTimeMS } from '@src/lib/util';

export const Leaderboard = (props: { goBack: () => void; trackId: number }) => {
  const [leaderboard, setLeaderboard] = useState<Phone.Racing.Leaderboard[]>([]);

  const fetchLeaderboard = async () => {
    const entries = await nuiAction(
      'phone/racing/getLeaderboard',
      { trackId: props.trackId },
      devData.phoneRacingLeaderboard
    );
    setLeaderboard(entries ?? []);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className='racing-app-leaderboard-container'>
      <div className='title'>
        <Tooltip title='Terug'>
          <Icon name={'chevron-left'} onClick={() => props.goBack()} size='.8rem' />
        </Tooltip>
      </div>
      <div>
        <Divider />
        {leaderboard.map(l => (
          <>
            <div key={`${l.name}-${l.model}`} className='racing-app-leaderboard-entry'>
              <div>
                {l.name} ({l.model})
              </div>
              <div>{formatTimeMS(l.time)}</div>
            </div>
            <Divider />
          </>
        ))}
      </div>
    </div>
  );
};
