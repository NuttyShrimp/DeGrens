import { RPC, Util } from '../classes';

if (GetCurrentResourceName() === 'ts-shared') {
  onNet('dgx:requestEnv', () => {
    emitNet('dgx:isProduction', source, !Util.isDevEnv());
  });

  RPC.register('dgx:createObject', async (src, model: string, coords: Vec3, routingBucket?: number) => {
    if (routingBucket == undefined) {
      routingBucket = GetPlayerRoutingBucket(String(src));
    }
    const entity = CreateObject(Util.getHash(model), coords.x, coords.y, coords.z, true, false, false);
    await Util.awaitCondition(() => DoesEntityExist(entity), 1000);
    if (!DoesEntityExist(entity)) return 0;
    SetEntityRoutingBucket(entity, routingBucket);
    // SetEntityDistanceCullingRadius(entity, 100);
    return NetworkGetNetworkIdFromEntity(entity);
  });
}
