import { Animations, Keys, Notifications, Peek, UI, Util } from '@dgx/client';

let holdingBMXVehicle = 0;
let animLoopId = 0;

Peek.addModelEntry('bmx', {
  options: [
    {
      label: 'Vastnemen',
      icon: 'fas fa-bicycle',
      action: (_, vehicle) => {
        if (!vehicle) return;
        holdBMX(vehicle);
      },
      canInteract: vehicle => {
        if (!vehicle) return false;
        return canHoldBMX(vehicle);
      },
    },
  ],
});

Keys.onPressDown('GeneralUse', () => {
  releaseBMX();
});

const canHoldBMX = (vehicle: number): boolean => {
  if (holdingBMXVehicle) return false;
  if (!DoesEntityExist(vehicle)) return false;
  if (!NetworkGetEntityIsNetworked(vehicle)) return false;
  const driverPed = GetPedInVehicleSeat(vehicle, -1);
  if (driverPed && DoesEntityExist(driverPed)) return false;
  const holder = GetEntityAttachedTo(vehicle);
  if (holder && DoesEntityExist(holder)) return false;
  return true;
};

const holdBMX = async (vehicle: number) => {
  if (!canHoldBMX(vehicle)) return;

  const hasControl = await Util.requestEntityControl(vehicle);
  if (!hasControl) {
    Notifications.add('Vasthouden mislukt, ga eens op het voertuig zitten en probeer opnieuw', 'error');
    return;
  }

  const ped = PlayerPedId();
  const bone = GetPedBoneIndex(ped, 24818);
  AttachEntityToEntity(vehicle, ped, bone, -0.36, 0.4, 0.13, -109, 3, -82, true, true, false, false, 2, true);

  animLoopId = Animations.startAnimLoop({
    animation: {
      dict: 'anim@heists@box_carry@',
      name: 'idle',
      flag: 49,
    },
    weight: 10,
    disableFiring: true,
    disabledControls: [25], // 23: enter veh, 25: aim, 44: take cover
  });

  holdingBMXVehicle = vehicle;

  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Loslaten`);
};

const releaseBMX = () => {
  if (!holdingBMXVehicle || !DoesEntityExist(holdingBMXVehicle)) return;

  DetachEntity(holdingBMXVehicle, true, true);
  Entity(holdingBMXVehicle).state.bmxBeingHelt = true;
  holdingBMXVehicle = 0;

  Animations.stopAnimLoop(animLoopId);
  animLoopId = 0;

  UI.hideInteraction();
};
