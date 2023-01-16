import React, { FC, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import { AppContainer } from '@src/main/phone/os/appcontainer/appcontainer';

import { useJobcenterAppStore } from '../stores/useJobcenterAppStore';

import { CurrentGroup } from './currentGroup';
import { Jobs } from './jobs';
import { List } from './list';

export const JobCenter: FC<{}> = () => {
  const [tab, setTab] = useState(0);
  const [currentGroup] = useJobcenterAppStore(s => [s.currentGroup]);
  return (
    <AppContainer>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} style={{ width: '100%' }} variant='fullWidth'>
        <Tab label='Groep' />
        <Tab label='Joblijst' />
      </Tabs>
      {tab == 0 && (currentGroup ? <CurrentGroup /> : <List />)}
      {tab == 1 && <Jobs />}
    </AppContainer>
  );
};
