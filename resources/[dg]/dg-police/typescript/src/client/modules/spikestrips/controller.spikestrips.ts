import { BaseEvents, Statebags, Util, Vehicles, PolyZone, RPC } from '@dgx/client';
import { SPIKE_MODEL, WHEELS } from './constants.spikestrips';
import { Vector4 } from '@dgx/shared';

let spikeThread: NodeJS.Timer | null = null;
const spikeEntities = new Set<number>();
const spikesWithZones = new Set<number>();

RPC.register('police:spikestrips:getPosition', async (amount: number) => {
  await Util.loadModel(SPIKE_MODEL);

  // do raycast to check if no vehicle at spikeposition
  const [min, max] = GetModelDimensions(SPIKE_MODEL);
  const spikeLength = max[1] - min[1];

  const ped = PlayerPedId();
  const pedCoords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(ped, 0, 0.5, -0.5));
  const startCoords = { ...pedCoords, w: GetEntityHeading(ped) };

  const endCoords = Util.getOffsetFromCoords(startCoords, { x: 0, y: spikeLength * amount, z: 0 });
  const [_, endCoordsZ] = GetGroundZFor_3dCoord(endCoords.x, endCoords.y, endCoords.z + 5, true);
  endCoords.z = endCoordsZ + 0.5;

  const rayHandle = StartShapeTestRay(
    startCoords.x,
    startCoords.y,
    startCoords.z,
    endCoords.x,
    endCoords.y,
    endCoords.z,
    2,
    ped,
    0
  );
  const hit = GetShapeTestResult(rayHandle)[1];
  if (hit) return;

  const objectsCreateData: Objects.SyncedCreateData[] = [];
  for (let i = 0; i < amount; i++) {
    const coords = Util.getOffsetFromCoords(startCoords, {
      x: 0,
      y: (spikeLength / 2) * (i * 2 + 1),
      z: 1,
    });
    objectsCreateData.push({
      model: 'p_ld_stinger_s',
      skipScheduling: true,
      skipStore: true,
      coords,
      rotation: { x: 0, y: 0, z: startCoords.w },
      flags: {
        onFloor: true,
        isSpikestrip: true,
      },
    });
  }

  return objectsCreateData;
});

onNet('police:spikestrips:doAnim', async () => {
  await Util.loadAnimDict('anim@heists@narcotics@trash');
  TaskPlayAnim(PlayerPedId(), 'anim@heists@narcotics@trash', 'drop_front', 8.0, 8.0, 800, 17, 1, false, false, false);
  RemoveAnimDict('anim@heists@narcotics@trash');
});

BaseEvents.onEnteredVehicle((vehicle, seat) => {
  if (seat !== -1) return;
  startSpikeThread(vehicle);
});

BaseEvents.onVehicleSeatChange((vehicle, newSeat, oldSeat) => {
  if (oldSeat === -1) {
    stopSpikeThread();
  }
  if (newSeat === -1) {
    startSpikeThread(vehicle);
  }
});

BaseEvents.onLeftVehicle(() => {
  stopSpikeThread();
});

Statebags.addEntityStateBagChangeHandler('localEntity', 'isSpikestrip', entity => {
  spikeEntities.add(entity);

  const ped = PlayerPedId();
  const vehicle = GetVehiclePedIsIn(ped, false);
  if (DoesEntityExist(vehicle) && GetPedInVehicleSeat(vehicle, -1) === ped) {
    startSpikeThread(vehicle);
  }
});

const startSpikeThread = (vehicle: number) => {
  if (spikeEntities.size === 0) return;

  const poppedTyres = new Set<number>();

  spikeThread = setInterval(() => {
    if (!DoesEntityExist(vehicle) || Vehicles.getVehicleSpeed(vehicle) < 3) return;
    if (Vehicles.getVehicleHasBulletProofTires(vehicle)) return;

    for (const entity of spikeEntities) {
      if (!DoesEntityExist(entity)) {
        spikeEntities.delete(entity);
        if (spikesWithZones.has(entity)) {
          PolyZone.removeZone('spikestrip', `spikestrip_${entity}`);
          spikesWithZones.delete(entity);
        }
        continue;
      }

      const entityCoords = Util.getEntityCoords(entity);
      if (Util.getEntityCoords(vehicle).distance(entityCoords) > 30) continue;
      const entityHeading = GetEntityHeading(entity);

      if (!spikesWithZones.has(entity)) {
        spikesWithZones.add(entity);
        PolyZone.addBoxZone('spikestrip', entityCoords, 3.7, 0.5, {
          heading: entityHeading,
          data: { id: `spikestrip_${entity}` },
          minZ: entityCoords.z - 1,
          maxZ: entityCoords.z + 1.5,
        });
      }

      if (!IsEntityTouchingEntity(vehicle, entity)) continue;

      for (let wheelIdx = 0; wheelIdx < WHEELS.length; wheelIdx++) {
        if (poppedTyres.has(wheelIdx)) continue;
        const wheelBone = GetEntityBoneIndexByName(vehicle, WHEELS[wheelIdx]);
        if (wheelBone === -1) continue;
        const wheelPos = Util.ArrayToVector3(GetWorldPositionOfEntityBone(vehicle, wheelBone));
        const wheelInside = PolyZone.isPointInside(wheelPos, 'spikestrip');
        if (!wheelInside) continue;
        if (!IsVehicleTyreBurst(vehicle, wheelIdx, true) || IsVehicleTyreBurst(vehicle, wheelIdx, false)) {
          SetVehicleTyreBurst(vehicle, wheelIdx, true, 1000.0);
          poppedTyres.add(wheelIdx);
          setTimeout(() => {
            poppedTyres.delete(wheelIdx);
          }, 1000);
        }
      }
    }
    if (spikeEntities.size === 0) {
      stopSpikeThread();
    }
  }, 10);
};

const stopSpikeThread = () => {
  if (!spikeThread) return;
  clearInterval(spikeThread);
  spikeThread = null;
};
