import { Events, RPC, Util } from '@dgx/client';

import { disableBlips, enableBlips } from '../../service/playerBlips';
import { setCmdState } from './state';

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
  if (!NetworkGetEntityIsNetworked(ent)) {
    SetEntityAsMissionEntity(ent, true, true);
    DeleteEntity(ent);
    return;
  }
  Events.emitNet('admin:server:deleteEntity', NetworkGetNetworkIdFromEntity(ent));
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
      offset = { x: 0, y: -1, z: 1 };
      break;
    case 2:
      offset = { x: 0, y: -2.5, z: 2 };
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

RPC.register('admin:cmd:getWaypointCoords', () => {
  const blip = GetFirstBlipInfoId(8);
  if (!blip) return null;
  const coords = GetBlipCoords(blip);
  return Util.ArrayToVector3(coords);
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

Events.onNet('admin:commands:cloack', toggle => {
  setCmdState('invisible', toggle);
});
