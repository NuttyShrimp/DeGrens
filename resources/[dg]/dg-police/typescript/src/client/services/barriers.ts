import { Events, Peek, SyncedObjects, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

const barriers: Map<number, { coords: Vec4; objIds: string[]; zone: number }> = new Map();

const registerBarrier = (id: number, coords: Vec4) => {
  if (barriers.has(id)) return;
  const objIds = SyncedObjects.add([
    {
      coords: Util.getOffsetFromCoords(coords, new Vector3(0, -0.5, 0)),
      rotation: { x: 0, y: 0, z: coords.w },
      model: 'prop_barrier_work05',
      flags: {
        onFloor: true,
        isBarrier: true,
        barrierId: id,
      },
    },
    {
      coords: Util.getOffsetFromCoords(coords, new Vector3(1.2, -0.5, 0)),
      rotation: { x: 0, y: 0, z: coords.w },
      model: 'prop_mp_cone_02',
      flags: {
        onFloor: true,
        isBarrier: true,
        barrierId: id,
      },
    },
    {
      coords: Util.getOffsetFromCoords(coords, new Vector3(-1.2, -0.5, 0)),
      rotation: { x: 0, y: 0, z: coords.w },
      model: 'prop_mp_cone_02',
      flags: {
        onFloor: true,
        isBarrier: true,
        barrierId: id,
      },
    },
  ]);
  const zone = AddRoadNodeSpeedZone(coords.x, coords.y, coords.z, 25.0, 0, false);

  barriers.set(id, { coords, objIds, zone });
};

Events.onNet('police:barriers:place', async () => {
  const ped = PlayerPedId();
  const animDict = 'pickup_object';
  const anim = 'pickup_low';
  await Util.loadAnimDict(animDict);
  TaskPlayAnim(ped, animDict, anim, 8.0, -8.0, -1, 1, 0.0, false, false, false);
  await Util.Delay(1200);
  StopAnimTask(ped, animDict, anim, 1.0);
});

Events.onNet('police:barriers:spawn', (id: number, coords: Vec4) => {
  registerBarrier(id, coords);
});

Events.onNet('police:barriers:sync', (barriersData: { id: number; coords: Vec4 }[]) => {
  barriersData.forEach(barrier => {
    registerBarrier(barrier.id, barrier.coords);
  });
});

Events.onNet('police:barriers:remove', (id: number) => {
  const barrier = barriers.get(id);
  if (!barrier) return;
  SyncedObjects.remove(barrier.objIds);
  barriers.delete(id);
  RemoveRoadNodeSpeedZone(barrier.zone);
});

Peek.addFlagEntry('isBarrier', {
  distance: 2,
  options: [
    {
      icon: 'circle',
      label: 'Remove Barrier',
      action: (data, ent) => {
        if (!ent) return;
        const barrierId = Entity(ent).state.barrierId;
        if (!barrierId) return;
        Events.emitNet('police:barriers:remove', barrierId);
      },
    },
  ],
});
