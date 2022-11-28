import { Events, RPC, Util } from '@dgx/client';

import { togglePlayerBlips } from '../../service/playerBlips';

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

Events.onNet('admin:commands:runCmd', (handler, args: any[]) => {
  if (args?.[1]?.entity && NetworkDoesNetworkIdExist(args[1].entity)) {
    args[1].entity = NetworkGetEntityFromNetworkId(args[1].entity);
  }
  const parameters = args.map((_: any, i: number) => `a${i}`);
  new Function(...parameters, `(${handler})(${parameters.join(',')})`)(...args);
});

Events.onNet('admin:command:attach', (target: number) => {
  const ped = PlayerPedId();
  AttachEntityToEntity(ped, target, 0, 0, -1, 1, 0, 0, 0, false, false, false, true, 2, true);
});

Events.onNet('admin:command:detach', () => {
  DetachEntity(PlayerPedId(), false, false);
});

Events.onNet('dg-admin:client:togglePlayerBlips', (toggle: boolean) => {
  togglePlayerBlips(toggle);
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
      ApplyDamageToPed(entity, 100, false);
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
