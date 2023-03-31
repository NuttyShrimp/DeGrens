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
    const job = Jobs.getCurrentJob(ply);
    if (!job) return;

    const playerData = DGCore.Functions.GetPlayer(ply)?.PlayerData;
    if (!playerData) return;

    const jobLabel = job === 'police' ? 'Agent' : 'Dokter';
    const plyName = `${playerData.charinfo.lastname} ${playerData.charinfo.firstname.charAt(0)}.`;
    blipInfo[ply] = {
      job,
      text: `${jobLabel} | [${playerData.metadata.callsign}] - ${plyName}`,
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
