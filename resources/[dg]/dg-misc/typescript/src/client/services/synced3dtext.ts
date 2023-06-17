import { Events, Util } from '@dgx/client';

const messages: Record<number, { msg: string; id: number }[]> = {};
let id = 0;
let showThread: NodeJS.Timer | null = null;

const createShowThread = () => {
  if (showThread) return;
  showThread = setInterval(() => {
    const ped = PlayerPedId();
    const coords = Util.getEntityCoords(ped);
    for (let target in messages) {
      for (let idx in messages[target]) {
        const trgtPed = GetPlayerPed(Number(target));
        const trgtCoords = Util.getEntityCoords(trgtPed);
        if (trgtCoords.distance(coords) > 10 || !HasEntityClearLosToEntity(ped, trgtPed, 13)) continue;
        Util.drawText3d(messages[target][idx].msg, trgtCoords.add({ x: 0, y: 0, z: 0.2 * Number(idx) }), 0.4, true, 4);
      }
    }
  }, 1);
};

Events.onNet('misc:synced3dtext:add', (target: number, msg: string) => {
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
