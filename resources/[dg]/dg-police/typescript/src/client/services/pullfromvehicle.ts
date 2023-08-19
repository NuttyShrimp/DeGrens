import { Jobs, RayCast, Sync, Util, Vehicles, Weapons } from '@dgx/client';

const NIGHTSTICK_NAME = 'weapon_nightstick';

let holdingNightStick = false;
let vehicleAimingAt: number | null = null;

let thread: NodeJS.Timer | null = null;

let pullingSomeoneFromVehicle = false;

setImmediate(() => {
  holdingNightStick = Weapons.getCurrentWeaponData()?.name === NIGHTSTICK_NAME;

  const hitEntity = RayCast.getLastHitResult().entity;
  if (hitEntity && validateEntityIsTarget(hitEntity)) {
    vehicleAimingAt = hitEntity;
    startPullFromVehicleThread();
  }
});

Weapons.onWeaponChanged(newWeapon => {
  if (newWeapon == null) {
    holdingNightStick = false;
    stopPullFromVehicleThread();
    return;
  }

  if (newWeapon !== NIGHTSTICK_NAME) return;

  holdingNightStick = true;

  const hitEntity = RayCast.getLastHitResult().entity;
  if (hitEntity && validateEntityIsTarget(hitEntity)) {
    vehicleAimingAt = hitEntity;
    startPullFromVehicleThread();
  }
});

RayCast.onEntityChange(entity => {
  if (!holdingNightStick) return;

  if (!entity) {
    vehicleAimingAt = null;
    stopPullFromVehicleThread();
    return;
  }

  if (validateEntityIsTarget(entity)) {
    vehicleAimingAt = entity;
    startPullFromVehicleThread();
  }
});

const validateEntityIsTarget = (entity: number) => DoesEntityExist(entity) && IsEntityAVehicle(entity);

const startPullFromVehicleThread = () => {
  if (Jobs.getCurrentJob().name !== 'police') return;

  stopPullFromVehicleThread();

  Util.debug('Started pull from vehicle thread');

  thread = setInterval(() => {
    DisableControlAction(0, 140, true);
    if (!IsDisabledControlJustPressed(0, 140)) return;

    pullFromVehicle();
  }, 1);
};

const stopPullFromVehicleThread = () => {
  if (thread === null) return;
  clearInterval(thread);
  thread = null;
  Util.debug('Stopped pull from vehicle thread');
};

const pullFromVehicle = async () => {
  if (pullingSomeoneFromVehicle) return;

  const target = Util.getClosestPlayer({ range: 2 });
  if (!target) return;

  const targetPed = GetPlayerPed(target);
  if (!targetPed || !DoesEntityExist(targetPed)) return;

  const vehicle = GetVehiclePedIsIn(targetPed, false);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  if (GetEntitySpeed(vehicle) > 2) return;

  const seatIdx = Vehicles.getSeatPedIsIn(vehicle, targetPed);
  if (seatIdx !== -1) return;

  pullingSomeoneFromVehicle = true;

  const ped = PlayerPedId();
  const targetRelationship = GetPedRelationshipGroupHash(targetPed);
  const ownRelationship = GetPedRelationshipGroupHash(ped);
  const originalRelationship = GetRelationshipBetweenGroups(ownRelationship, targetRelationship);

  Vehicles.setVehicleDoorsLocked(vehicle, false);

  await Util.loadAnimDict('veh@break_in@0h@p_m_zero@');
  TaskPlayAnim(ped, 'veh@break_in@0h@p_m_zero@', 'std_force_entry_ds', 8.0, -8.0, -1, 0, 0, false, false, false);
  await Util.Delay(1000);

  if (IsVehicleWindowIntact(vehicle, 0)) {
    Sync.executeAction('police:pullFromVehicle:smashWindow', vehicle, 0);
    SmashVehicleWindow(vehicle, 0); // breaking particles only played for local client
  }

  await Util.Delay(1000);

  SetRelationshipBetweenGroups(5, ownRelationship, targetRelationship);
  SetPedCanBeDraggedOut(targetPed, true);
  TaskEnterVehicle(ped, vehicle, -1, 0, 1.0, 524288, 0);

  setTimeout(() => {
    SetRelationshipBetweenGroups(originalRelationship, ownRelationship, targetRelationship);
    SetPedCanBeDraggedOut(targetPed, false);

    RemoveAnimDict('veh@break_in@0h@p_m_zero@');

    pullingSomeoneFromVehicle = false;
  }, 5000);
};

Sync.registerActionHandler('police:pullFromVehicle:smashWindow', (vehicle, windowsIdx: number) => {
  SmashVehicleWindow(vehicle, windowsIdx);
});
