import { Events, Keys, Peek, PolyZone, UI } from '@dgx/client';
import {
  cleanupSanddigging,
  doSpotAction,
  finishJob,
  isAtVehicleReturn,
  setAssignedSpot,
  setAssignedVehicle,
  setAtVehicleReturn,
} from './service.sanddigging';

Peek.addFlagEntry('isSanddiggingFuck', {
  options: [
    {
      icon: 'fas fa-shovel',
      label: 'Inklokken',
      action: () => {
        Events.emitNet('materials:sanddigging:signIn');
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
  distance: 3.0,
});

PolyZone.onEnter('sanddigging_vehicle', () => {
  if (!IsPedInAnyVehicle(PlayerPedId(), false)) return;
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Wegzetten`);
  setAtVehicleReturn(true);
});

PolyZone.onLeave('sanddigging_vehicle', () => {
  UI.hideInteraction();
  setAtVehicleReturn(false);
});

Keys.onPressDown('GeneralUse', () => {
  if (!isAtVehicleReturn()) return;
  finishJob();
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

PolyZone.onEnter('sanddigging_quarry', () => {
  Events.emitNet('jobs:sanddigging:checkActive');
});
