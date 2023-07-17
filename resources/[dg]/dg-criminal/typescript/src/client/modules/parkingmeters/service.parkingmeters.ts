import { Events, Minigames, Notifications, Peek, RPC, Taskbar, Util } from '@dgx/client';
import { startParkingMeterAnimation } from './helpers.parkingmeters';

let peekIds: string[] | null = null;

// just client cache for parking meters that he looted himself to hide peek option
// does not get synced or anything, actual validation is done on server
let lootedParkingMeters = new Set<number>();

export const registerParkingMeterPeekOptions = (models: string[]) => {
  if (peekIds !== null) {
    Peek.removeModelEntry(peekIds);
  }

  peekIds = Peek.addModelEntry(models, {
    options: [
      {
        label: 'Openbreken',
        icon: 'fas fa-hammer-crash',
        action: (_, ent) => {
          if (!ent || !DoesEntityExist(ent)) return;
          startLootingParkingMeter(ent);
        },
        canInteract: ent => {
          if (!ent || !DoesEntityExist(ent)) return false;
          return !lootedParkingMeters.has(ent) && !HasObjectBeenBroken(ent);
        },
        items: 'lockpick',
      },
    ],
  });
};

const startLootingParkingMeter = async (entity: number) => {
  const coords = Util.getEntityCoords(entity);
  const canLoot = await RPC.execute<boolean>('criminal:parkingmeters:start', coords);
  if (!canLoot) {
    lootedParkingMeters.add(entity);
    Notifications.add('Deze parkeermeter is al opengebroken', 'error');
    return;
  }

  const ownCoords = Util.getPlyCoords();
  const heading = Util.getHeadingToFaceEntity(entity);
  await Util.goToCoords({ ...ownCoords, w: heading });

  const success = await Minigames.keygame(5, 10, 20);
  if (!success) {
    Events.emitNet('criminal:parkingmeters:finish', false);
    return;
  }

  const stopAnim = await startParkingMeterAnimation();

  const [canceled] = await Taskbar.create('hammer-crash', 'Openbreken', 10000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });

  stopAnim();

  if (canceled) {
    Events.emitNet('criminal:parkingmeters:finish', false);
    return;
  }

  Events.emitNet('criminal:parkingmeters:finish', true);
  lootedParkingMeters.add(entity);
};
