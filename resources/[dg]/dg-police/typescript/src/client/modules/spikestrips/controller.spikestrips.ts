import { BaseEvents, Events, PolyZone, Statebags, Sync, Util, Vehicles } from '@dgx/client';
import { WHEELS } from './constants.spikestrips';

let spikeThread: NodeJS.Timer | null = null;
const spikeEntities = new Set<number>();
const spikesWithZones = new Set<number>();

onNet('police:spikestrips:doAnim', async () => {
  await Util.loadAnimDict('anim@heists@narcotics@trash');
  TaskPlayAnim(PlayerPedId(), 'anim@heists@narcotics@trash', 'drop_front', 8.0, 8.0, 800, 17, 1, false, false, false);
});

Sync.registerActionHandler('police:spikestrips:setup', async entity => {
  const entCoord = Util.getEntityCoords(entity);
  SetEntityVisible(entity, false, false);
  SetEntityCoordsNoOffset(entity, entCoord.x, entCoord.y, entCoord.z + 2.5, false, false, false);
  await Util.Delay(100);
  PlaceObjectOnGroundProperly(entity);
  SetEntityVisible(entity, true, false);
});

BaseEvents.onEnteredVehicle((vehicle, seat) => {
  if (seat !== -1) return;
  if (spikeEntities.size === 0) return;
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

Statebags.addEntityStateBagChangeHandler('entity', 'spikestrip', (netId, entity) => {
  spikeEntities.add(entity);

  const ped = PlayerPedId();
  const vehicle = GetVehiclePedIsIn(ped, false);
  if (DoesEntityExist(vehicle) && GetPedInVehicleSeat(vehicle, -1) === ped) {
    startSpikeThread(vehicle);
  }
});

const startSpikeThread = (vehicle: number) => {
  if (spikeThread) return;

  const hasBulletProofTires = Vehicles.getVehicleHasBulletProofTires(vehicle);

  spikeThread = setInterval(() => {
    if (hasBulletProofTires) return;
    if (!DoesEntityExist(vehicle)) return;
    if (Vehicles.getVehicleSpeed(vehicle) < 1) return;

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
      if (Util.getEntityCoords(vehicle).distance(entityCoords) > 50) continue;
      const entityHeading = GetEntityHeading(entity);

      if (!spikesWithZones.has(entity)) {
        spikesWithZones.add(entity);
        PolyZone.addBoxZone('spikestrip', entityCoords, 3.7, 0.6, {
          heading: entityHeading,
          data: { id: `spikestrip_${entity}` },
          minZ: entityCoords.z - 1,
          maxZ: entityCoords.z + 2,
        });
      }

      if (!IsEntityTouchingEntity(vehicle, entity)) continue;

      for (let wheelIdx = 0; wheelIdx < WHEELS.length; wheelIdx++) {
        const wheelBone = GetEntityBoneIndexByName(vehicle, WHEELS[wheelIdx]);
        if (wheelBone === -1) continue;
        const wheelPos = Util.ArrayToVector3(GetWorldPositionOfEntityBone(vehicle, wheelBone));
        const wheelInside = PolyZone.isPointInside(wheelPos, 'spikestrip');
        if (!wheelInside) continue;
        if (!IsVehicleTyreBurst(vehicle, wheelIdx, true) || IsVehicleTyreBurst(vehicle, wheelIdx, false)) {
          SetVehicleTyreBurst(vehicle, wheelIdx, true, 1000.0);
        }
      }
    }

    if (spikeEntities.size === 0) {
      stopSpikeThread();
    }
  }, 50);
};

const stopSpikeThread = () => {
  if (!spikeThread) return;
  clearInterval(spikeThread);
  spikeThread = null;
};
