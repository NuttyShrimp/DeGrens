import { BaseEvents, Events, Keys, Peek, PolyZone, UI } from '@dgx/client';
import {
  checkNewLocation,
  cleanupSanddigging,
  doSpotAction,
  finishJob,
  isAtVehicleReturn,
  isEntityAssignedVehicle,
  setAssignedSpot,
  setAssignedVehicle,
  setAtVehicleReturn,
  setInAssignedVehicle,
} from './service.sanddigging';

Peek.addFlagEntry('isSanddiggingFuck', {
  options: [
    {
      icon: 'fas fa-shovel',
      label: 'Inklokken',
      action: () => {
        Events.emitNet('jobs:sanddigging:signIn');
      },
    },
  ],
  distance: 3.0,
});

Peek.addZoneEntry('sanddigging_spot', {
  options: [
    {
      icon: 'fas fa-shovel',
      label: 'Graven',
      action: () => {
        doSpotAction();
      },
    },
  ],
  distance: 7.0,
});

PolyZone.onEnter('sanddigging_vehicle', () => {
  const vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
  if (!vehicle || !isEntityAssignedVehicle(vehicle)) return;
  setAtVehicleReturn(true);
});

PolyZone.onLeave('sanddigging_vehicle', () => {
  setAtVehicleReturn(false);
});

Keys.onPressDown('GeneralUse', () => {
  if (isAtVehicleReturn()) {
    finishJob();
    return;
  }
  checkNewLocation();
});

Events.onNet('jobs:sanddigging:leftGroup', () => {
  cleanupSanddigging();
});

Events.onNet('jobs:sanddigging:start', (vehNetId: number) => {
  setAssignedVehicle(vehNetId);
});

Events.onNet('jobs:sanddigging:addTarget', (spotId: number) => {
  setAssignedSpot(spotId);
});

BaseEvents.onEnteredVehicle((vehicle, seat) => {
  if (seat !== -1) return;
  if (!isEntityAssignedVehicle(vehicle)) return;
  if (isAtVehicleReturn()) return;
  setInAssignedVehicle(true);
});

BaseEvents.onVehicleSeatChange((vehicle, newSeat, oldSeat) => {
  if (oldSeat === -1) {
    setInAssignedVehicle(false);
  }
  if (newSeat === -1 && isEntityAssignedVehicle(vehicle)) {
    setInAssignedVehicle(true);
  }
});

BaseEvents.onLeftVehicle(() => {
  setInAssignedVehicle(false);
});
