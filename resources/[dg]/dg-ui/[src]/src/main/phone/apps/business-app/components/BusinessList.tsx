import React, { FC, useEffect, useState } from 'react';
import { Paper } from '@src/components/paper';
import { useUpdateState } from '@src/lib/redux';
import { AppContainer } from '@src/main/phone/os/appcontainer/appcontainer';

export const BusinessList: FC<{ list: Phone.Business.Business[] }> = props => {
  const updateState = useUpdateState('phone.apps.business');
  const [businesses, setBusinesses] = useState(props.list);

  useEffect(() => {
    setBusinesses(props.list);
  }, [props.list]);

  const selectBusiness = (id: number) => {
    updateState({
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
