import { Events, Hospital, Keys, Police, PolyZone, RayCast } from '@dgx/client';
import {
  changeDoorState,
  enterDoorPolyZone,
  handleEntityChange,
  handleToggleKeyPress,
  hideInteraction,
  leaveDoorPolyZone,
  loadDoors,
  tryToDetcordDoor,
  tryToGateUnlockDoor,
  tryToLockpickDoor,
  tryToThermiteDoor,
} from 'services/doors';

let inDebounce = false;

Keys.register('toggleDoor', 'Toggle Deurslot', 'P');
Keys.onPressDown('toggleDoor', () => {
  if (Police.isCuffed() || Hospital.isDown()) return;

  if (inDebounce) {
    return;
  } else {
    inDebounce = true;
    setTimeout(() => {
      inDebounce = false;
    }, 250);
  }

  handleToggleKeyPress();
});

Events.onNet('doorlock:client:changeDoorState', (newStates: { id: number; state: boolean }[]) => {
  newStates.forEach(d => {
    changeDoorState(d.id, d.state);
  });
});

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;
  hideInteraction();
});

RayCast.onEntityChange((entity, coords) => {
  handleEntityChange(entity, coords);
});

PolyZone.onEnter<{ id: number }>('doorlock', (_, data, center) => {
  enterDoorPolyZone(data.id, center);
});

PolyZone.onLeave<{ id: number }>('doorlock', (_, data) => {
  leaveDoorPolyZone(data.id);
});

Events.onNet('doorlock:client:useLockpick', tryToLockpickDoor);
Events.onNet('doorlock:client:useThermite', tryToThermiteDoor);
Events.onNet('doorlock:client:useDetcord', tryToDetcordDoor);
Events.onNet('doorlock:client:useGateUnlock', tryToGateUnlockDoor);

Events.onNet('doorlock:client:loadDoors', loadDoors);
