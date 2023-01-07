import { Events, Hospital, Keys, Police, PolyZone, RayCast } from '@dgx/client';
import {
  changeDoorState,
  enterDoorPolyZone,
  handleEntityChange,
  handleToggleKeyPress,
  hideInteraction,
  leaveDoorPolyZone,
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

Events.onNet('doorlock:client:changeDoorState', (doorId: number, state: boolean) => {
  changeDoorState(doorId, state);
});

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;
  hideInteraction();
});

RayCast.onEntityChange(entity => {
  handleEntityChange(entity);
});

PolyZone.onEnter<{ id: number }>('doorlock', (_, data, center) => {
  enterDoorPolyZone(data.id, center);
});

PolyZone.onLeave<{ id: number }>('doorlock', (_, data) => {
  leaveDoorPolyZone(data.id);
});

Events.onNet('doorlock:client:useLockpick', () => {
  tryToLockpickDoor();
});

Events.onNet('doorlock:client:useThermite', () => {
  tryToThermiteDoor();
});
