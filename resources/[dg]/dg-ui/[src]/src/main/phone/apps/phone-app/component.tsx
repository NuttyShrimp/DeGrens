import { useState } from 'react';
import DialpadIcon from '@mui/icons-material/Dialpad';
import PhoneIcon from '@mui/icons-material/Phone';
import { Tab, Tabs } from '@mui/material';

import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Dialer } from './components/dialer';
import { PhoneList } from './components/list';

const Component = () => {
  const [tab, setTab] = useState(0);

  // TODO: add slide transition
  return (
    <AppContainer>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant='fullWidth'>
        <Tab icon={<PhoneIcon />} />
        <Tab icon={<DialpadIcon />} />
      </Tabs>
      {tab === 0 && <PhoneList />}
      {tab === 1 && <Dialer />}
    </AppContainer>
  );
};

export default Component;
