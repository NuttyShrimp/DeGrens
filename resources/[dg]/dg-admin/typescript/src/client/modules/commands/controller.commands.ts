import { Events, RPC, Util } from '@dgx/client';

import { togglePlayerBlips } from '../../service/playerBlips';

// TODO: replace with DGX events if same side emitting is added to cross side emitting
onNet('admin:commands:damageEntity', (ent: number) => {
  ent = Number(ent);
  if (!NetworkGetEntityIsNetworked(ent) || NetworkGetEntityOwner(ent) === PlayerId()) {
    switch (GetEntityType(ent)) {
      case 1: {
        ApplyDamageToPed(ent, 100, false);
        break;
      }
      case 2: {
        SetVehicleDamage(ent, 0.0, 0.0, 0.33, 200.0, 100.0, true);
        SetVehicleEngineHealth(ent, Math.max(0, GetVehicleEngineHealth(ent) - 250));
        SetVehicleBodyHealth(ent, Math.max(0, GetVehicleBodyHealth(ent) - 250));
        break;
      }
    }
    return;
  }
  emitNet('admin:commands:damageEntity', NetworkGetNetworkIdFromEntity(ent));
});

onNet('admin:commands:deleteEntity', async (ent: number) => {
  ent = Number(ent);
  if (!NetworkGetEntityIsNetworked(ent) || NetworkGetEntityOwner(ent) === PlayerId()) {
    await Util.requestEntityControl(ent);
    SetEntityAsMissionEntity(ent, true, true);
    DeleteEntity(ent);
    return;
  }
  emitNet('admin:commands:deleteEntity', NetworkGetNetworkIdFromEntity(ent));
});

Events.onNet('admin:commands:runCmd', (handler, args: any[]) => {
  if (args?.[1]?.entity && NetworkDoesNetworkIdExist(args[1].entity)) {
    args[1].entity = NetworkGetEntityFromNetworkId(args[1].entity);
  }
  const parameters = args.map((_: any, i: number) => `a${i}`);
  new Function(...parameters, `(${handler})(${parameters.join(',')})`)(...args);
});

Events.onNet('admin:cmd:setPlayerVisible', (toggle: boolean) => {
  SetEntityVisible(PlayerPedId(), toggle, false);
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
