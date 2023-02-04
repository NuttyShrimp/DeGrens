import { Events, Jobs } from '@dgx/server';

let blipPlys: number[] = [];
let disabledPlys: Set<number> = new Set();

export const syncBlips = () => {
  const policePlys = Jobs.getPlayersForJob('police');
  const ambuPlys = Jobs.getPlayersForJob('ambulance');
  const newPlys = [...policePlys, ...ambuPlys].filter(ply => !disabledPlys.has(ply));
  const oldPlys = blipPlys.filter(ply => !newPlys.includes(ply));
  blipPlys = newPlys;

  const blipInfo: Record<number, Dispatch.BlipInfo> = {};
  blipPlys.forEach(ply => {
    const DGPlayer = DGCore.Functions.GetPlayer(ply);
    blipInfo[ply] = {
      job: Jobs.getCurrentJob(ply)!,
      callsign: DGPlayer.PlayerData.metadata.callsign,
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
  blipPlys.forEach(ply => {
    Events.emitNet('dispatch:updateSprite', ply, src, sprite);
  });
};

export const togglePlayer = (src: number, shouldRemove: boolean) => {
  if (shouldRemove) {
    disabledPlys.delete(src);
  } else {
    disabledPlys.add(src);
  }
};

export const cleanPlayer = (src: number) => {
  disabledPlys.delete(src);
};
