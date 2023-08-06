import { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import { Icon } from '@src/components/icon';

import { AppContainer } from '../../os/appcontainer/appcontainer';

import { BuyProperty } from './components/BuyProperty';
import { OwnedPropertiesList } from './components/OwnedList';

import './styles/realestate-app.scss';

export const Component = () => {
  const [tab, setTab] = useState(0);

  return (
    <AppContainer>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant='fullWidth'>
        <Tab icon={<Icon name='house-user' />} />
        <Tab icon={<Icon name='magnifying-glass-dollar' />} />
      </Tabs>
      {tab === 0 && <OwnedPropertiesList />}
      {tab === 1 && <BuyProperty />}
    </AppContainer>
  );
};
