import { Events, Hospital, Keys, Minigames, Peek, Police, Util } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';

import { setClassesWithoutLock, toggleVehicleLock } from './service.keys';
import { hasVehicleKeys } from './cache.keys';

let animThread: NodeJS.Timer | null = null;
const lockpickAnimations = {
  door: {
    animDict: 'veh@break_in@0h@p_m_one@',
    play: () => {
      const doAnim = () => {
        TaskPlayAnim(
          PlayerPedId(),
          'veh@break_in@0h@p_m_one@',
          'low_force_entry_ds',
          3.0,
          3.0,
          -1.0,
          17,
          0,
          false,
          false,
          false
        );
      };

      doAnim();
      animThread = setInterval(doAnim, 1000);
    },
    stop: () => {
      if (animThread !== null) {
        clearInterval(animThread);
        animThread = null;
      }
      StopAnimTask(PlayerPedId(), 'veh@break_in@0h@p_m_one@', 'low_force_entry_ds', 1.0);
    },
  },
  hotwire: {
    animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
    play: () => {
      TaskPlayAnim(
        PlayerPedId(),
        'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
        'machinic_loop_mechandplayer',
        8.0,
        8.0,
        -1,
        17,
        0,
        false,
        false,
        false
      );
    },
    stop: () => {
      const ped = PlayerPedId();
      const vehData = Util.getCurrentVehicleInfo(); // the animcancel SOMEHOW tps ped out of veh
      StopAnimTask(ped, 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@', 'machinic_loop_mechandplayer', 1);
      if (vehData) {
        SetPedIntoVehicle(ped, vehData.vehicle, vehData.seat);
      }
    },
  },
};

Events.onNet(
  'vehicles:keys:startLockpick',
  async (type: keyof typeof lockpickAnimations, id: string, amount: number, diff: { speed: number; size: number }) => {
    const animData = lockpickAnimations[type];
    await Util.loadAnimDict(animData.animDict);
    animData.play();
    const lockpickResult = await Minigames.keygame(amount, diff.speed, diff.size);
    animData.stop();
    Events.emitNet('vehicles:keys:finishLockPick', type, id, lockpickResult);
  }
);

Keys.onPressDown('vehicle-lock', () => {
  if (Police.isCuffed() || Hospital.isDown()) return;
  toggleVehicleLock();
});

Keys.register('vehicle-lock', 'Toggle auto slot', 'L');

on('vehicles:keys:share', () => {
  const veh = getCurrentVehicle();
  if (!veh) return;
  const numSeats = GetVehicleModelNumberOfSeats(GetEntityModel(veh));
  Events.emitNet('vehicles:keys:shareToPassengers', NetworkGetNetworkIdFromEntity(veh), numSeats);
});

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Geef Sleutels',
      icon: 'fas fa-key',
      action: (_, entity) => {
        if (!entity) return;
        const numSeats = GetVehicleModelNumberOfSeats(GetEntityModel(entity));
        Events.emitNet('vehicles:keys:shareToClosest', NetworkGetNetworkIdFromEntity(entity), numSeats);
      },
      canInteract: ent => {
        if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
        if (!hasVehicleKeys(ent)) return false;
        if (IsPedInAnyVehicle(PlayerPedId(), false)) return false;
        // Option enabled if someone in driverseat, passenger seats or close and outside vehicle
        return (
          !IsVehicleSeatFree(ent, -1) ||
          GetVehicleNumberOfPassengers(ent) > 0 ||
          Util.isAnyPlayerCloseAndOutsideVehicle(3)
        );
      },
    },
  ],
  distance: 2,
});

Events.onNet('vehicles:keys:setClassesWithoutLock', (classes: number[]) => {
  setClassesWithoutLock(classes);
});
