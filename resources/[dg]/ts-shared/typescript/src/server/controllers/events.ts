import { Events, RPC, Util, Vehicles } from '../classes';

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
      let entity: number;
      if (entityType === 'object') {
        entity = CreateObject(hash, coords.x, coords.y, coords.z, true, false, false);
      } else {
        const heading = 'w' in coords ? coords.w : 0;
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
    DeleteEntity(entity);
  });

  Events.onNet('dgx:vehicles:setLock', (_, netId: number, locked: boolean) => {
    const entity = NetworkGetEntityFromNetworkId(netId);
    if (!entity || !DoesEntityExist(entity)) return;
    Vehicles.setVehicleDoorsLocked(entity, locked);
  });
}
