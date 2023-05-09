import { Events, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

const messages: Record<number, { msg: string; id: number }[]> = {};
let id = 0;
let showThread: NodeJS.Timer | null = null;

const createShowThread = () => {
  if (showThread) return;
  showThread = setInterval(() => {
    const ped = PlayerPedId();
    for (let target in messages) {
      for (let idx in messages[target]) {
        const trgtPed = GetPlayerPed(Number(target));
        let trgtCoords: Vec3 = Util.getEntityCoords(trgtPed);
        const inLos = HasEntityClearLosToEntity(ped, trgtPed, 13);
        if (inLos) {
          trgtCoords = (trgtCoords as Vector3).add({ x: 0, y: 0, z: 0.2 * Number(idx) });
          Util.drawText3d(messages[target][idx].msg, trgtCoords, 0.4, true, 4);
        }
      }
    }
  }, 1);
};

Events.onNet('dg-misc:me:show', (target: number, msg: string) => {
  const ply = GetPlayerFromServerId(target);
  if (!ply) return;
  if (!messages[ply]) {
    messages[ply] = [];
  }
  const mId = id++;
  messages[ply].push({
    msg,
    id: mId,
  });
  if (!showThread) {
    createShowThread();
  }
  setTimeout(() => {
    messages[ply] = messages[ply].filter(m => m.id !== mId);
    if (messages[ply].length == 0) {
      delete messages[ply];
    }
    if (Object.keys(messages).length === 0 && showThread) {
      clearInterval(showThread);
      showThread = null;
    }
  }, 10000);
});
