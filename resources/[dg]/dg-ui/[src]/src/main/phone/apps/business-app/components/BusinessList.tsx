import React, { FC, useEffect, useState } from 'react';
import { Paper } from '@src/components/paper';
import { AppContainer } from '@src/main/phone/os/appcontainer/appcontainer';

import { useBusinessAppStore } from '../stores/useBusinessAppStore';

export const BusinessList: FC<{ list: Phone.Business.Business[] }> = props => {
  const updateStore = useBusinessAppStore(s => s.updateStore);
  const [businesses, setBusinesses] = useState(props.list);

  useEffect(() => {
    setBusinesses(props.list);
  }, [props.list]);

  const selectBusiness = (id: number) => {
    updateStore({
      currentBusiness: id,
      activeApp: 'employee',
    });
  };

  return (
    <AppContainer
      emptyList={Object.keys(props.list).length === 0}
      search={{
        list: props.list,
        filter: ['label'],
        onChange: setBusinesses,
      }}
    >
      <div>
        {businesses.map(business => (
          <Paper
            key={business.id}
            title={business.label}
            description={business.role}
            image={'briefcase'}
            onClick={() => selectBusiness(business.id)}
          />
        ))}
      </div>
    </AppContainer>
  );
};
