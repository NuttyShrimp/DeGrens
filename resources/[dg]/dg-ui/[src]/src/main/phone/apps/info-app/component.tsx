import React, { useEffect } from 'react';

import { nuiAction } from '../../../../lib/nui-comms';
import { genericAction, getState } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { InfoApp } from './components/infoapp';

const Component: AppFunction<Phone.Info.Props> = props => {
  const refreshValues = async () => {
    const info = await nuiAction('phone/info/fetchInfo');
    const newEntries: Phone.Info.InfoAppEntry[] = getState<Phone.Info.Props>('phone.apps.info').entries.map(
      (entry: Phone.Info.InfoAppEntry) => {
        if (info[entry.name]) {
          entry.value = info[entry.name];
        }
        return entry;
      }
    );
    genericAction('phone.apps.info', { entries: newEntries });
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
      <InfoApp entries={props.entries} />
    </AppContainer>
  );
};

export default Component;
