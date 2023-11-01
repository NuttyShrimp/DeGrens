import { PropsWithChildren, useEffect, useState } from 'react';
import { FaCog, FaRoad } from 'react-icons/fa';
import { CircularProgress, Tab, Tabs } from '@mui/material';
import { Icon } from '@src/components/icon';
import { nuiAction } from '@src/lib/nui-comms';

import { AppContainer } from '../../os/appcontainer/appcontainer';

import { CurrentRace } from './components/currentRace';
import { RaceSettings } from './components/raceSettings';
import { RaceList } from './components/racesList';
import { TrackList } from './components/trackList';
import { useRacingAppStore } from './stores/racingAppStore';
import { loadTracks } from './lib';

import './styles/racing-app.scss';

const TabHelper = ({ children, idx, tab }: PropsWithChildren<{ idx: number; tab: number }>) => {
  return <div hidden={tab !== idx}>{tab === idx && children}</div>;
};

const Component: AppFunction = () => {
  const [tab, setTab] = useState(-1);
  const [alias, setRacingAlias, joinedRace] = useRacingAppStore(s => [s.racingAlias, s.setRacingAlias, s.selectedRace]);
  const [fetchingAlias, setFetchingAlias] = useState(true);

  const fetchAlias = async () => {
    let alias = await nuiAction('phone/racing/getAlias', undefined, 'Big Boi Racer'); //undefined); // 'Big Boi Racer');
    if (alias === '') alias = undefined;
    setTab(alias === undefined ? 2 : 0);
    setRacingAlias(alias ?? undefined);
    setFetchingAlias(false);
  };

  useEffect(() => {
    setRacingAlias(alias ?? undefined);
    if (alias) setFetchingAlias(false);
  }, [alias]);

  useEffect(() => {
    fetchAlias();
    loadTracks();
  }, []);

  return (
    <AppContainer>
      {fetchingAlias ? (
        <div className='center' style={{ marginTop: '5vh' }}>
          <CircularProgress />
          <div className='center'>
            <p>Loading race alias</p>
          </div>
        </div>
      ) : (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant='fullWidth'>
            <Tab
              sx={{ minWidth: 'unset' }}
              icon={<Icon name={'flag'} size={'1rem'} />}
              aria-label='Races'
              disabled={alias === undefined}
            />
            <Tab
              sx={{ minWidth: 'unset' }}
              icon={<FaRoad size={'1rem'} />}
              aria-label='Tracks'
              disabled={alias === undefined}
            />
            <Tab
              sx={{ minWidth: 'unset' }}
              icon={<FaCog size={'1rem'} />}
              aria-label='Settings'
              disabled={alias === undefined}
            />
          </Tabs>
          <TabHelper idx={0} tab={tab}>
            {joinedRace ? <CurrentRace /> : <RaceList />}
          </TabHelper>
          <TabHelper idx={1} tab={tab}>
            <TrackList />
          </TabHelper>
          <TabHelper idx={2} tab={tab}>
            <RaceSettings />
          </TabHelper>
        </>
      )}
    </AppContainer>
  );
};

export default Component;
