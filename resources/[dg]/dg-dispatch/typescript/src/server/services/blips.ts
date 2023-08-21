import { Events, Jobs } from '@dgx/server';
import { charModule } from 'helpers/core';

let blipPlys: number[] = [];
const disabledPlys: Set<number> = new Set();
const overrideSprites = new Map<number, number>();

export const syncBlips = () => {
  const policePlys = Jobs.getPlayersForJob('police');
  const ambuPlys = Jobs.getPlayersForJob('ambulance');
  const newPlys = [...policePlys, ...ambuPlys].filter(ply => !disabledPlys.has(ply));
  const oldPlys = blipPlys.filter(ply => !newPlys.includes(ply));
  blipPlys = newPlys;

  const blipInfo: Record<number, Dispatch.BlipInfo> = {};
  blipPlys.forEach(ply => {
    const job = Jobs.getCurrentJob(ply);
    if (!job) return;

    const player = charModule.getPlayer(ply);
    if (!player) return;

    const jobLabel = job === 'police' ? 'Agent' : 'Dokter';
    const plyName = `${player.charinfo.lastname} ${player.charinfo.firstname.charAt(0)}.`;
    blipInfo[ply] = {
      job,
      text: `${jobLabel} | [${player.metadata.callsign}] - ${plyName}`,
      sprite: overrideSprites.get(ply),
    };
  });
  blipPlys.forEach(ply => {
    Events.emitNet('dispatch:syncBlips', ply, blipInfo);
  });
  oldPlys.forEach(ply => {
    if (!GetPlayerName(String(ply))) return;
    Events.emitNet('dispatch:removeBlips', ply);
  });
};

export const updateSprite = (src: number, sprite: number) => {
  overrideSprites.set(src, sprite);
  blipPlys.forEach(ply => {
    Events.emitNet('dispatch:updateSprite', ply, src, sprite);
  });
};

export const setPlayerAsDisabled = (plyId: number, toggle: boolean, dontSync = false) => {
  if (toggle) {
    disabledPlys.add(plyId);
  } else {
    disabledPlys.delete(plyId);
  }
  if (!dontSync) {
    syncBlips();
  }
};
