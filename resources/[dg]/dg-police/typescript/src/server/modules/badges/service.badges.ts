import { Events, Util } from '@dgx/server';

export const showBadge = (plyId: number, type: BadgeType) => {
  Events.emitNet('police:badges:doAnimation', plyId);
  setTimeout(async () => {
    const cid = Util.getCID(plyId);
    const name = await Util.getCharName(cid);
    const playersInRange = [...Util.getAllPlayersInRange(plyId, 3), plyId];
    playersInRange.forEach(id => {
      Events.emitNet('police:badges:openUI', id, type, name);
    });
  }, 1500);
};
