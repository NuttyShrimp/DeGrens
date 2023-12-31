import { Events, Keys, Notifications, PropAttach, RPC, SyncedObjects, UI, Util } from '@dgx/client';

import { disableBlips, enableBlips } from '../../service/playerBlips';
import { copyEntityCoordsToClipboard, toggleLocalVis } from './service.commands';
import { getCmdState, setCmdState } from './state.commands';
import { toggleNoclip } from 'service/noclip';

// Functiontypes fuck up when putting this in command directly because that file is serversided but function gets executed on client
on('admin:commands:damageEntity', (ent: number) => {
  ent = Number(ent);
  if (!NetworkGetEntityIsNetworked(ent) || NetworkGetEntityOwner(ent) === PlayerId()) {
    damageEntity(ent);
    return;
  }
  Events.emitNet('admin:server:damageEntity', NetworkGetNetworkIdFromEntity(ent));
});
on('admin:commands:deleteEntity', (ent: number) => {
  ent = Number(ent);
  const entState = Entity(ent).state;
  if (entState.objId) {
    if (entState.isSynced) {
      Events.emitNet('dg-misc:objectmanager:deleteSynced', entState.objId);
      return;
    } else {
      SyncedObjects.remove(entState.objId);
      return;
    }
  }
  if (!NetworkGetEntityIsNetworked(ent)) {
    SetEntityAsMissionEntity(ent, true, true);
    DeleteEntity(ent);
    return;
  }
  Util.deleteEntity(ent);
});
on('admin:commands:toggleFreezeEntity', (ent: number) => {
  const entity = Number(ent);
  const isFrozen = IsEntityPositionFrozen(entity);

  if (!NetworkGetEntityIsNetworked(entity)) {
    FreezeEntityPosition(entity, !isFrozen);
    return;
  }
  Events.emitNet('admin:server:toggleFreezeEntity', NetworkGetNetworkIdFromEntity(entity), isFrozen);
});
on('admin:commands:copyCoords', (ent: number) => {
  copyEntityCoordsToClipboard(ent);
});

Events.onNet('admin:commands:runCmd', (handler, args: any[]) => {
  if (args?.[1]?.entity && NetworkDoesNetworkIdExist(args[1].entity)) {
    args[1].entity = NetworkGetEntityFromNetworkId(args[1].entity);
  }
  const parameters = args.map((_: any, i: number) => `a${i}`);
  new Function(...parameters, `(${handler})(${parameters.join(',')})`)(...args);
});

Events.onNet('admin:command:attach', (netId: number) => {
  const ped = PlayerPedId();
  const targetEntity = NetworkGetEntityFromNetworkId(netId);

  let offset: Vec3;
  switch (GetEntityType(targetEntity)) {
    case 1:
      offset = { x: 0, y: -2, z: 2 };
      break;
    case 2:
      offset = { x: 0, y: -3.5, z: 3 };
      break;
    default:
      throw new Error('Invalid attach entity');
  }

  if (!DoesEntityExist(targetEntity)) {
    throw new Error('Attach entity does not exist');
  }
  AttachEntityToEntity(ped, targetEntity, 0, offset.x, offset.y, offset.z, 0, 0, 0, false, false, false, true, 2, true);
});

Events.onNet('admin:command:detach', () => {
  DetachEntity(PlayerPedId(), false, false);
});

Events.onNet('dg-admin:client:togglePlayerBlips', (toggle: boolean) => {
  toggle ? enableBlips() : disableBlips();
});

Events.onNet('admin:client:damageEntity', (netId: number) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  if (!entity || !DoesEntityExist(entity)) return;
  damageEntity(entity);
});

const damageEntity = (entity: number) => {
  switch (GetEntityType(entity)) {
    case 1: {
      ApplyDamageToPed(entity, 100, true);
      break;
    }
    case 2: {
      SetVehicleDamage(entity, 0.0, 0.0, 0.33, 200.0, 100.0, true);
      SetVehicleEngineHealth(entity, Math.max(0, GetVehicleEngineHealth(entity) - 250));
      SetVehicleBodyHealth(entity, Math.max(0, GetVehicleBodyHealth(entity) - 250));
      break;
    }
  }
};

Events.onNet('admin:command:fadeIn', () => {
  DoScreenFadeIn(0);
});

RPC.register('admin:command:isValidPed', (hash: number) => IsModelAPed(hash));

Events.onNet('admin:command:setModel', async (model: string) => {
  const hash = GetHashKey(model);
  await Util.loadModel(hash);

  if (!HasModelLoaded(model)) {
    console.log(`Failed to load model ${model}`);
    return;
  }

  SetPlayerModel(PlayerId(), hash);
  SetPedComponentVariation(PlayerPedId(), 0, 0, 0, 0);
});

Events.onNet('admin:command:collision', () => {
  const ped = PlayerPedId();
  const isDisabled = GetEntityCollisionDisabled(ped);
  SetEntityCompletelyDisableCollision(ped, isDisabled, isDisabled);
  SetGravityLevel(isDisabled ? 0 : 2);
});

Events.onNet('admin:commands:cloak', toggle => {
  setCmdState('cloak', toggle);
  toggleLocalVis(toggle);

  if (toggle) {
    Notifications.add('cloak actief', 'info', undefined, true, 'ADMIN_CLOAK_NOTIFICATION');
    PropAttach.toggleProps(false);
  } else {
    Notifications.remove('ADMIN_CLOAK_NOTIFICATION');
    if (!getCmdState('noclip')) {
      PropAttach.toggleProps(true);
    }
  }
});

Events.onNet('admin:commands:tpm', async () => {
  const blip = GetFirstBlipInfoId(8);
  if (!blip) {
    Notifications.add('Je hebt geen waypoint', 'error');
    return;
  }
  const coords = Util.ArrayToVector3(GetBlipCoords(blip));

  const ped = PlayerPedId();
  const vehicle = GetVehiclePedIsIn(ped, false);

  const oldCoords = Util.getPlyCoords();
  SetPedCoordsKeepVehicle(ped, ...Util.Vector3ToArray(coords));
  FreezeEntityPosition(vehicle ?? ped, true);
  let found, groundZ;
  for (let zCoord = 825; zCoord > 0; zCoord -= 25) {
    NewLoadSceneStart(coords.x, coords.y, zCoord, coords.x, coords.y, zCoord, 50, 0);
    await Util.awaitCondition(() => IsNetworkLoadingScene(), 1000);
    NewLoadSceneStop();
    coords.z = zCoord;
    SetPedCoordsKeepVehicle(ped, ...Util.Vector3ToArray(coords));

    RequestCollisionAtCoord(...Util.Vector3ToArray(coords));
    await Util.awaitCondition(() => HasCollisionLoadedAroundEntity(ped), 1000);

    [found, groundZ] = GetGroundZFor_3dCoord(coords.x, coords.y, coords.z, false);
    if (found) {
      SetPedCoordsKeepVehicle(ped, coords.x, coords.y, groundZ);
      break;
    }
  }

  FreezeEntityPosition(vehicle ?? ped, false);
  if (!found) {
    console.log(`Could not find ground for ${coords.x}, ${coords.y}, ${coords.z}`);
    SetPedCoordsKeepVehicle(ped, ...Util.Vector3ToArray(oldCoords));
  }
});

Events.onNet('admin:commands:teleportInVehicle', (netId: number) => {
  if (!NetworkDoesEntityExistWithNetworkId(netId)) {
    Notifications.add('Voertuig is niet in je buurt', 'error');
    return;
  }
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) {
    Notifications.add('Voertuig is niet in je buurt', 'error');
    return;
  }

  const numSeats = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle));
  let freeSeat: number | undefined = undefined;
  for (let i = numSeats - 2; i >= -1; i--) {
    if (IsVehicleSeatFree(vehicle, i)) {
      freeSeat = i;
      break;
    }
  }
  if (freeSeat === undefined) {
    Notifications.add('Er is geen plaats in het voertuig', 'error');
    return;
  }

  if (getCmdState('noclip')) {
    toggleNoclip(false);
  }

  TaskWarpPedIntoVehicle(PlayerPedId(), vehicle, freeSeat);
});

Events.onNet('admin:commands:materialDebug', (toggle: boolean) => {
  const alreadyToggled = getCmdState('materialDebug');
  setCmdState('materialDebug', toggle);

  if (alreadyToggled) return;

  let currentMaterial = '';
  const thread = setInterval(() => {
    if (!getCmdState('materialDebug')) {
      clearInterval(thread);
      return;
    }
    const material = Util.getGroundMaterial();
    if (material !== currentMaterial) {
      currentMaterial = material;
      console.log(`[Admin] Current material: ${currentMaterial}`);
    }
  }, 10);
});

Events.onNet('admin:commands:kickFromVehicle', () => {
  const ped = PlayerPedId();
  const vehicle = GetVehiclePedIsIn(ped, false);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  TaskLeaveVehicle(ped, vehicle, 16);
});

Events.onNet('admin:commands:addEventBlip', (coords: Vec3, time: number) => {
  const blip = AddBlipForCoord(coords.x, coords.y, coords.z);
  SetBlipSprite(blip, 439);
  SetBlipColour(blip, 2);
  SetBlipScale(blip, 1.1);
  SetBlipAsShortRange(blip, false);
  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString('Evenement');
  EndTextCommandSetBlipName(blip);

  setTimeout(
    () => {
      if (!DoesBlipExist(blip)) return;
      RemoveBlip(blip);
    },
    time * 60 * 1000
  );
});

Keys.register('admin-copy-coords', '(zAdmin) Copy coords');
Keys.onPressDown('admin-copy-coords', () => {
  copyEntityCoordsToClipboard();
});
