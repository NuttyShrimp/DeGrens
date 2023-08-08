import { Auth, Events, Util } from '@dgx/server';
import { Vector4 } from '@dgx/shared';

const barriers: { id: number; coords: Vec4 }[] = [];
let barrierId = 0;

Events.onNet('police:barriers:create', async plyId => {
  Events.emitNet('police:barriers:place', plyId);
  const coords = Vector4.createFromVec3(Util.getPlyCoords(plyId), 0).add(0);
  coords.w = GetEntityHeading(GetPlayerPed(String(plyId))) + 180;
  const id = ++barrierId;
  barriers.push({ id, coords });
  Events.emitNet('police:barriers:spawn', -1, id, coords);
});

Auth.onAuth(plyId => {
  Events.emitNet('police:barriers:sync', plyId, barriers);
});

Events.onNet('police:barriers:remove', (src, id: number) => {
  const index = barriers.findIndex(barrier => barrier.id === id);
  if (index === -1) return;
  barriers.splice(index, 1);
  Events.emitNet('police:barriers:remove', -1, id);
  Events.emitNet('police:barriers:place', src);
});
