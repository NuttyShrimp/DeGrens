import { Events, Keys, PolyZone, Util, UI, Minigames, Inventory, Particles, RayCast } from '@dgx/client';
import { doDoorAnimation, getDoorId, isAuthorized } from 'helpers/doors';

let doors: Doorlock.ClientData = {};
let currentDoor: { id: number; coords: Vec3; state: boolean } | null = null;
let interactionVisible = false;
let isInPolyZone = false;

let activeDoorEntity: number | undefined = undefined;
let debounceTimeout: NodeJS.Timeout | null = null;
let doorThread: NodeJS.Timer | null = null;

export const loadDoors = (doorData: Doorlock.ClientData) => {
  doors = doorData;

  for (const key of Object.keys(doors)) {
    const id = Number(key);
    const door = doors[id];
    if (IsDoorRegisteredWithSystem(id)) {
      RemoveDoorFromSystem(id);
    }

    AddDoorToSystem(id, door.model, door.coords.x, door.coords.y, door.coords.z, false, false, false);
    const state = door.locked ? 1 : 0;

    if (doors[id].forceOpen) {
      DoorSystemSetDoorState(id, 1, false, true);
      setTimeout(() => {
        DoorSystemSetOpenRatio(id, state ? 0.001 : 1, true, true);
      }, 1000); // need to wait till door state is synced or whatever
    } else {
      DoorSystemSetDoorState(id, state ? 1 : 0, false, true);
    }

    if (door.polyzone) {
      PolyZone.addBoxZone('doorlock', door.polyzone.center, door.polyzone.length, door.polyzone.width, {
        heading: door.polyzone.heading,
        minZ: door.polyzone.center.z - 4,
        maxZ: door.polyzone.center.z + 10,
        data: {
          id,
        },
      });
    }
  }

  console.log(`[Doorlock] ${Object.keys(doors).length} doors have been loaded`);
};

export const handleToggleKeyPress = () => {
  let { id: doorId, state: doorState } = currentDoor ?? {};

  // if not in polyzone or currently aiming at door, try to find door that is blocked (garage door in ceiling for example)
  if (!doorId) {
    const raycastHit = RayCast.doRaycast(10, 16); // flag only intersects with entities to allow toggling of garage doors which are fully hidden
    if (raycastHit.entity && GetEntityType(raycastHit.entity) === 3) {
      const id = getDoorId(raycastHit.entity);
      if (id && doors[id]?.allowThroughWalls) {
        doorId = id;
      }
    }
  }

  if (!doorId) return;

  if (doorState === undefined) {
    doorState = getDoorState(doorId);
  }

  const data = doors[doorId];
  if (!isAuthorized(data)) return;

  if (!data.noAnimation) {
    doDoorAnimation();
  }

  Events.emitNet('doorlock:server:changeDoorState', doorId, !doorState);
};

export const changeDoorState = (doorId: number, state: boolean) => {
  if (!doors[doorId] || !IsDoorRegisteredWithSystem(doorId)) {
    console.error(`[Doorlock] Tried to change state of door that was not registered (${doorId})`);
    return;
  }

  doors[doorId].locked = state;

  if (doors[doorId].forceOpen) {
    DoorSystemSetOpenRatio(doorId, state ? 0.001 : 1, true, true);
  } else {
    DoorSystemSetDoorState(doorId, state ? 1 : 0, false, true);
  }

  if (doorId === currentDoor?.id) {
    currentDoor.state = state;
    showInteraction();
  }
};

const showInteraction = () => {
  if (currentDoor === null) return;
  const data = doors[currentDoor.id];
  if (data.hideInteraction) return;

  interactionVisible = true;
  if (isAuthorized(data)) {
    if (data.locked) {
      UI.showInteraction(`${Keys.getBindedKey('+toggleDoor')} - Locked`, 'error');
    } else {
      UI.showInteraction(`${Keys.getBindedKey('+toggleDoor')} - Unlocked`, 'success');
    }
  } else {
    if (data.locked) {
      UI.showInteraction(`Locked`, 'error');
    } else {
      UI.showInteraction(`Unlocked`, 'success');
    }
  }
};

export const hideInteraction = () => {
  if (!interactionVisible) return;
  UI.hideInteraction();
  interactionVisible = false;
};

export const handleEntityChange = (entity: number | undefined) => {
  if (isInPolyZone) return;

  if (debounceTimeout !== null) {
    clearTimeout(debounceTimeout);
  }

  debounceTimeout = setTimeout(
    () => {
      hideInteraction();

      const doorId = getDoorId(entity);
      if (!entity || !doorId || !doors[doorId]) {
        activeDoorEntity = undefined;
        currentDoor = null;
        return;
      }

      const maxDistance = doors[doorId].distance;
      activeDoorEntity = entity;

      if (doorThread !== null) {
        clearInterval(doorThread);
      }

      // Distance thread
      doorThread = setInterval(() => {
        if (activeDoorEntity !== entity) return;

        const doorCoords = Util.getEntityCoords(entity);
        const distance = Util.getPlyCoords().distance(doorCoords);
        if (distance <= maxDistance) {
          currentDoor = {
            id: doorId,
            coords: doorCoords,
            state: getDoorState(doorId),
          };
          if (!interactionVisible) {
            showInteraction();
          }
        } else {
          currentDoor = null;
          if (interactionVisible) {
            hideInteraction();
          }
        }
      }, 10);
    },
    entity === undefined ? 1500 : 0
  );
};

export const enterDoorPolyZone = (doorId: number, coords: Vec3) => {
  isInPolyZone = true;

  currentDoor = {
    id: doorId,
    coords,
    state: getDoorState(doorId),
  };

  if (!interactionVisible) {
    showInteraction();
  }
};

export const leaveDoorPolyZone = (doorId: number) => {
  isInPolyZone = false;

  if (currentDoor?.id !== doorId) return;
  currentDoor = null;
  hideInteraction();
};

export const tryToLockpickDoor = async () => {
  const plyCoords = Util.getPlyCoords();
  for (const key of Object.keys(doors)) {
    const id = Number(key);
    const door = doors[id];
    if (!door.lockpickable) continue;
    if (!door.locked) continue;
    if (plyCoords.distance(door.coords) > 1.5) continue;
    const success = await Minigames.keygame(3, 1, 5);
    Events.emitNet('dg-doorlock:server:triedLockpickingDoor', id);
    if (success) {
      Events.emitNet('doorlock:server:changeDoorState', id, false);
    }
    break;
  }
};

export const tryToThermiteDoor = async () => {
  const ped = PlayerPedId();
  const pedCoords = Util.getPlyCoords();

  let doorId: number | null = null;
  for (const key of Object.keys(doors)) {
    const id = Number(key);
    const door = doors[id];
    if (!door.thermiteable) continue;
    if (!door.locked) continue;
    if (pedCoords.distance(door.coords) > 1.5) continue;
    doorId = id;
    break;
  }
  if (doorId === null) return;

  const thermiteData = doors[doorId].thermiteable;
  const removed = await Inventory.removeItemByNameFromPlayer('thermite');
  if (!removed || !thermiteData) return;

  await Util.loadModel('hei_p_m_bag_var22_arm_s');
  await Util.loadModel('hei_prop_heist_thermite');
  await Util.loadAnimDict('anim@heists@ornate_bank@thermal_charge');

  SetEntityCoords(ped, thermiteData.ped.x, thermiteData.ped.y, pedCoords.z - 0.9, false, false, false, false);
  const position = Util.getPlyCoords();
  const rotation = Util.ArrayToVector3(GetEntityRotation(ped, 0));
  const scene = NetworkCreateSynchronisedScene(
    position.x,
    position.y,
    position.z,
    rotation.x,
    rotation.y,
    thermiteData.ped.heading,
    2,
    false,
    false,
    1065353216,
    0,
    1.3
  );

  const bagObject = CreateObject(`hei_p_m_bag_var22_arm_s`, position.x, position.y, position.z, true, true, false);
  SetEntityCollision(bagObject, false, true);
  NetworkAddPedToSynchronisedScene(
    ped,
    scene,
    'anim@heists@ornate_bank@thermal_charge',
    'thermal_charge',
    1.5,
    -4.0,
    1,
    16,
    1148846080,
    0
  );
  NetworkAddEntityToSynchronisedScene(
    bagObject,
    scene,
    'anim@heists@ornate_bank@thermal_charge',
    'bag_thermal_charge',
    4.0,
    -8.0,
    1
  );
  NetworkStartSynchronisedScene(scene);

  await Util.Delay(1500);

  const thermiteObject = CreateObject(
    `hei_prop_heist_thermite`,
    position.x,
    position.y,
    position.z + 0.2,
    true,
    true,
    true
  );
  SetEntityCollision(thermiteObject, false, true);
  AttachEntityToEntity(
    thermiteObject,
    ped,
    GetPedBoneIndex(ped, 28422),
    0,
    0,
    0,
    0,
    0,
    200.0,
    true,
    true,
    false,
    true,
    1,
    true
  );

  await Util.Delay(4000);

  DeleteObject(bagObject);
  DetachEntity(thermiteObject, true, true);
  FreezeEntityPosition(thermiteObject, true);

  TaskPlayAnim(
    ped,
    'anim@heists@ornate_bank@thermal_charge',
    'cover_eyes_intro',
    8.0,
    8.0,
    1000,
    36,
    1,
    false,
    false,
    false
  );
  await Util.Delay(1000);
  TaskPlayAnim(
    ped,
    'anim@heists@ornate_bank@thermal_charge',
    'cover_eyes_loop',
    8.0,
    8.0,
    3000,
    49,
    1,
    false,
    false,
    false
  );

  const success = await Minigames.sequencegame(thermiteData.grid, thermiteData.amount, 5);

  if (success) {
    const netId = NetworkGetNetworkIdFromEntity(thermiteObject);
    const particleId = Particles.add({
      dict: 'scr_ornate_heist',
      name: 'scr_heist_ornate_thermal_burn',
      looped: true,
      netId,
      offset: { x: 0, y: 0.65, z: 0 },
      scale: 0.7,
    });
    await Util.Delay(10000);
    Particles.remove(particleId);
    Events.emitNet('doorlock:server:changeDoorState', doorId, false);
  }

  ClearPedTasks(ped);
  if (DoesEntityExist(thermiteObject)) {
    DeleteEntity(thermiteObject);
  }
  NetworkStopSynchronisedScene(scene);
};

export const getDoorState = (doorId: number) => {
  if (doors[doorId]?.forceOpen) {
    return doors[doorId].locked;
  }

  return DoorSystemGetDoorState(doorId) !== 0;
};
