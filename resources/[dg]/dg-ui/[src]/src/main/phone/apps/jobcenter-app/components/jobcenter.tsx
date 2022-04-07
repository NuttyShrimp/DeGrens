import React, { FC, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import { AppContainer } from '@src/main/phone/os/appcontainer/appcontainer';

import { CurrentGroup } from './currentGroup';
import { Jobs } from './jobs';
import { List } from './list';

export const JobCenter: FC<Phone.JobCenter.Props> = props => {
  const [tab, setTab] = useState(0);
  return (
    <AppContainer>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} style={{ width: '100%' }} variant='fullWidth'>
        <Tab label='Groep' />
        <Tab label='Joblijst' />
      </Tabs>
      {tab == 0 &&
        (props.currentGroup ? (
          <CurrentGroup
            currentGroup={props.currentGroup}
            updateState={props.updateState}
            groupMembers={props.groupMembers}
            isOwner={props.isOwner}
            isReady={props.isReady}
          />
        ) : (
          <List groups={props.groups} updateState={props.updateState} />
        ))}
      {tab == 1 && <Jobs jobs={props.jobs} />}
    </AppContainer>
  );
};
