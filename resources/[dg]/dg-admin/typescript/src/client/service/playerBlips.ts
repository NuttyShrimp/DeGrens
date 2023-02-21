import { Sync, Util, EntityBlip } from '@dgx/client';

import { drawText3d } from '../modules/util/service.util';
import { getPlayerName } from './names';

let blipsEnabled = false;
const plyBlips: Map<number, EntityBlip> = new Map();

export const enableBlips = () => {
  blipsEnabled = true;
  const plyId = PlayerId();

  const textInterval = setInterval(() => {
    if (!blipsEnabled) {
      clearInterval(textInterval);
      return;
    }
    GetActivePlayers().forEach((ply: number) => {
      if (ply === plyId) return;
      const isTalking = !!MumbleIsPlayerTalking(ply);
      const ped = GetPlayerPed(ply);
      const vehicle = GetVehiclePedIsIn(ped, false);
      let coords: Vec3;
      if (vehicle && DoesEntityExist(vehicle)) {
        coords = Util.getEntityCoords(vehicle);
        const seat = Util.getSeatPedIsIn(vehicle, ped);
        coords.z += (seat + 2) * 0.6;
      } else {
        coords = Util.getEntityCoords(ped);
        coords.z += 1.0;
      }
      const serverId = GetPlayerServerId(ply);
      drawText3d(`${isTalking ? '~g~' : ''}${getPlayerName(serverId)}(${serverId})`, coords, 0.4);
    });
  }, 1);

  const allPlayerCoords = Sync.getAllPlayerCoords();
  for (const key of Object.keys(allPlayerCoords)) {
    addBlip(Number(key));
  }
};

export const disableBlips = () => {
  blipsEnabled = false;
  plyBlips.forEach(blip => {
    blip.destroy();
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
    text: () => `${getPlayerName(plyId)}(${plyId})`,
  });
  plyBlips.set(plyId, newBlip);
};

const removeBlip = (plyId: number) => {
  const blip = plyBlips.get(plyId);
  if (!blip) return;
  blip.destroy();
  plyBlips.delete(plyId);
};

Sync.onPlayerCoordsUpdate((plyCoords: Record<number, Vec3>) => {
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

    const blip = plyBlips.get(plyId);
    if (blip) {
      blip.updateCoords(plyCoords[plyId]);
    } else {
      addBlip(plyId);
    }
  }
});
