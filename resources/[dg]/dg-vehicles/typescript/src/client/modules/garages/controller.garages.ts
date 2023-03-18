import { Events, PolyZone, RayCast, UI } from '@dgx/client';

import { isOnParkingSpot, registerGarages } from './service.garages';

onNet('vehicles:garages:load', (garages: Garage.Garage[]) => {
  registerGarages(garages);
});

on('dg-vehicles:garages:park', () => {
  const { entity: targetVeh } = RayCast.doRaycast();
  if (!targetVeh || !IsEntityAVehicle(targetVeh) || !NetworkGetEntityIsNetworked(targetVeh)) return;
  Events.emitNet('vehicles:garage:park', NetworkGetNetworkIdFromEntity(targetVeh));
});

UI.RegisterUICallback('vehicles:garage:takeVehicle', (data: { vin: string }, cb) => {
  Events.emitNet('vehicles:garage:takeVehicle', data.vin);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('vehicles:garage:tryToRecover', (data: { vin: string }, cb) => {
  Events.emitNet('vehicles:garage:recoverVehicle', data.vin);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

PolyZone.onEnter<{ id: string }>('garage', (_, data) => {
  Events.emitNet('vehicles:garage:enteredZone', data.id);
});
PolyZone.onLeave('garage', () => {
  Events.emitNet('vehicles:garage:leftZone');
});

global.asyncExports('isOnParkingSpot', isOnParkingSpot);
