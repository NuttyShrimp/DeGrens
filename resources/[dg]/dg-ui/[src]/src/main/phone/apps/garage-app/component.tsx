import React, { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { VehicleList } from './components/VehicleList';

const Component: AppFunction<Phone.Garage.State> = props => {
  const fetchVehicles = async () => {
    const vehicles = await nuiAction('phone/garage/get', {}, devData.phoneVehicles);
    props.updateState({
      list: vehicles,
    });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);
  return (
    <AppContainer emptyList={props.list.length === 0}>
      <VehicleList />
    </AppContainer>
  );
};

export default Component;
