import { useEffect, useState } from 'react';
import { devData } from '@src/lib/devdata';

import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { InfoApp } from './components/infoapp';

const Component: AppFunction = () => {
  const [entries, setEntries] = useState<Phone.Info.InfoAppEntry[]>([]);

  const refreshValues = async () => {
    const info = await nuiAction('phone/info/fetchInfo', undefined, devData.phoneInfoApp);
    setEntries(info);
  };

  useEffect(() => {
    refreshValues();
  }, []);

  return (
    <AppContainer
      primaryActions={[
        {
          title: 'Refresh',
          onClick: () => refreshValues(),
          icon: 'sync-alt',
        },
      ]}
    >
      <InfoApp entries={entries} />
    </AppContainer>
  );
};

export default Component;
