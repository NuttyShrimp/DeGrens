import { Sync, Util, EntityBlip } from '@dgx/client';

import { drawText3d } from '../modules/util/service.util';

let blipsEnabled = false;
const plyBlips: Map<number, EntityBlip> = new Map();

export const togglePlayerBlips = (isEnabled: boolean) => {
  isEnabled ? enableBlips() : disableBlips();
};

const enableBlips = () => {
  blipsEnabled = true;
  const plyId = PlayerId();

  const textInterval = setInterval(() => {
    if (!blipsEnabled) {
      clearInterval(textInterval);
      return;
    }
    GetActivePlayers().forEach((ply: number) => {
      if (ply === plyId) return;
      const ped = GetPlayerPed(ply);
      const coords = Util.getEntityCoords(ped);
      coords.z += 1.0;
      drawText3d(`${GetPlayerName(ply)}(${GetPlayerServerId(ply)})`, coords, 0.4);
    });
  }, 1);

  const allPlayerCoords = Sync.getAllPlayerCoords();
  for (const key of Object.keys(allPlayerCoords)) {
    addBlip(Number(key));
  }
};

const disableBlips = () => {
  blipsEnabled = false;
  plyBlips.forEach(blip => {
    blip.disable();
  });
  plyBlips.clear();
};

const addBlip = (plyId: number) => {
  if (GetPlayerServerId(PlayerId()) === plyId) return;
  const newBlip = new EntityBlip('player', plyId, {
    sprite: 1,
    color: 0,
    heading: true,
    category: 7,
    text: `${GetPlayerName(GetPlayerFromServerId(plyId))}(${plyId})`,
    shortRange: true,
  });
  newBlip.enable();
  plyBlips.set(plyId, newBlip);
};

const removeBlip = (plyId: number) => {
  const blip = plyBlips.get(plyId);
  if (!blip) return;
  blip.disable();
  plyBlips.delete(plyId);
};

onNet('sync:coords:sync', (plyCoords: Record<number, Vec3>) => {
  if (!blipsEnabled) return;

  // If plyids have blips but not in allcoords anymore, they left server so remove blip
  const disconnectedPlayers = [...plyBlips.keys()].reduce<number[]>((acc, id) => {
    if (!plyCoords[id]) acc.push(id);
    return acc;
  }, []);
  disconnectedPlayers.forEach(id => {
    removeBlip(id);
  });

  for (const key in plyCoords) {
    const plyId = Number(key);
    if (GetPlayerServerId(PlayerId()) === plyId) continue;

    const blip = plyBlips.get(plyId);
    if (!blip) {
      addBlip(plyId);
      continue;
    }

    const existLocally = blip.doesEntityExistsLocally();
    if (blip.getMode() === 'entity') {
      if (!existLocally) {
        blip.changeMode('coords');
      }
    } else {
      if (existLocally) {
        blip.changeMode('entity');
      } else {
        blip.updateCoords(plyCoords[plyId]);
      }
    }
  }
});
