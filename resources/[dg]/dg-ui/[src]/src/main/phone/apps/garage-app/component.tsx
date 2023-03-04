import React, { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { VehicleList } from './components/VehicleList';
import { useGarageAppStore } from './stores/useGarageAppStore';

const Component = () => {
  const [setList, listLen] = useGarageAppStore(s => [s.setList, s.list.length]);
  const fetchVehicles = async () => {
    const vehicles = await nuiAction('phone/garage/get', {}, devData.phoneVehicles);
    setList(vehicles);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);
  return (
    <AppContainer emptyList={listLen === 0}>
      <VehicleList fetchVehicles={fetchVehicles} />
    </AppContainer>
  );
};

export default Component;
