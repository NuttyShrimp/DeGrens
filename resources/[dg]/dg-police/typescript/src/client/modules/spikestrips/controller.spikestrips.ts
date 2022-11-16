import { Events, PolyZone, Util } from '@dgx/client';
import { WHEELS } from './constants.spikestrips';

let zoneId = 0;

Events.onNet('police:spikestrips:place', async () => {
  const ped = PlayerPedId();
  const heading = GetEntityHeading(ped);

  await Util.loadAnimDict('anim@heists@narcotics@trash');
  TaskPlayAnim(ped, 'anim@heists@narcotics@trash', 'drop_front', 8.0, 8.0, 800, 17, 1, false, false, false);
  await Util.Delay(500);

  const modelHash = GetHashKey('p_ld_stinger_s');
  await Util.loadModel(modelHash);
  const netIds: number[] = [];

  [...new Array(2)].forEach((_, i) => {
    const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(ped, 0, 2 * (i + 1) + 1.7 * i, -1));
    const obj = CreateObject(modelHash, coords.x, coords.y, coords.z, true, false, false);
    SetEntityHeading(obj, heading);
    PlaceObjectOnGroundProperly(obj);
    FreezeEntityPosition(obj, true);
    netIds.push(NetworkGetNetworkIdFromEntity(obj));
  });

  const center = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(ped, 0, 3.7, -1));

  setTimeout(() => {
    Events.emitNet('police:spikestrips:add', netIds, center, heading);
  }, 100);
});

Events.onNet('police:spikestrips:sync', (timeout: number, center: Vec3, heading: number) => {
  let zoneBuilt = false;
  zoneId++;
  const newZoneId = String(zoneId);

  const ped = PlayerPedId();
  const tick = setInterval(() => {
    const vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle === 0) return;
    if (GetEntitySpeed(vehicle) * 3.6 < 1) return;
    if (Util.getEntityCoords(ped).distance(center) > 50) return;

    if (!zoneBuilt) {
      zoneBuilt = true;
      PolyZone.addBoxZone('spikestrip', center, 7.4, 0.6, {
        heading: heading,
        data: { id: newZoneId },
        minZ: center.z - 0.2,
        maxZ: center.z + 1,
      });
    }

    WHEELS.forEach((wheelBoneName, wheelIdx) => {
      const wheelBone = GetEntityBoneIndexByName(vehicle, wheelBoneName);
      if (wheelBone === -1) return;
      const wheelPos = Util.ArrayToVector3(GetWorldPositionOfEntityBone(vehicle, wheelBone));
      const wheelInside = PolyZone.isPointInside(wheelPos, 'spikestrip');
      if (!wheelInside) return;
      if (!IsVehicleTyreBurst(vehicle, wheelIdx, true) || IsVehicleTyreBurst(vehicle, wheelIdx, false)) {
        SetVehicleTyreBurst(vehicle, wheelIdx, false, 1000.0);
      }
    });
  }, 0);

  setTimeout(() => {
    clearInterval(tick);
    PolyZone.removeZone('spikestrip', newZoneId);
  }, timeout);
});
