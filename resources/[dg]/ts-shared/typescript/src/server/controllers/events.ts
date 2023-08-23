import { Events, RPC, Util, Vehicles } from '@dgx/server';

if (GetCurrentResourceName() === 'ts-shared') {
  onNet('dgx:requestEnv', () => {
    emitNet('dgx:isProduction', source, !Util.isDevEnv());
  });

  RPC.register(
    'dgx:createEntity',
    async (
      plyId: number,
      entityType: 'object' | 'ped',
      model: string | number,
      coords: Vec3 | Vec4,
      routingBucket?: number,
      stateBags?: Record<string, any>
    ) => {
      if (routingBucket == undefined) {
        routingBucket = GetPlayerRoutingBucket(String(plyId));
      }

      const hash = typeof model === 'string' ? GetHashKey(model) : model;
      const heading = 'w' in coords ? coords.w : 0;
      let entity: number;
      if (entityType === 'object') {
        entity = CreateObject(hash, coords.x, coords.y, coords.z, true, false, false);
        SetEntityHeading(entity, heading);
      } else {
        entity = CreatePed(4, hash, coords.x, coords.y, coords.z, heading, true, true);
      }

      await Util.awaitCondition(() => DoesEntityExist(entity), 1000);
      if (!DoesEntityExist(entity)) return 0;

      SetEntityRoutingBucket(entity, routingBucket);
      // SetEntityDistanceCullingRadius(entity, 100);

      for (const key in stateBags) {
        Entity(entity).state.set(key, stateBags[key], true);
      }

      const netId = NetworkGetNetworkIdFromEntity(entity);
      return netId;
    }
  );

  Events.onNet('dgx:deleteEntity', (plyId, netId: number) => {
    const entity = NetworkGetEntityFromNetworkId(netId);
    if (!entity || !DoesEntityExist(entity)) return;

    if (GetEntityType(entity) === 2) {
      Vehicles.deleteVehicle(entity);
    } else {
      DeleteEntity(entity);
    }
  });
}
