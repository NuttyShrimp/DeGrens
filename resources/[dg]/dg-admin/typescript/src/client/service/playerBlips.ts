import { Sync, Util, BlipManager, Vehicles } from '@dgx/client';
import { getPlayerName } from './names';

let blipsEnabled = false;
const playersWithBlips = new Set<number>();

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
        const seat = Vehicles.getSeatPedIsIn(vehicle, ped);
        coords.z += (seat + 2) * 0.6;
      } else {
        coords = Util.getEntityCoords(ped);
        coords.z += 1.0;
      }
      const serverId = GetPlayerServerId(ply);
      Util.drawText3d(`${isTalking ? '~g~' : ''}${getPlayerName(serverId)}(${serverId})`, coords, 0.4);
    });
  }, 1);

  // Trigger handler manually to avoid delay when enabling
  const allPlayerCoords = Sync.getAllPlayerCoords();
  handlePlayerCoordsUpdate(allPlayerCoords);
};

export const disableBlips = () => {
  BlipManager.deletePlayerBlip([...playersWithBlips], 'admin');
  playersWithBlips.clear();
  blipsEnabled = false;
};

// We just use this as a way to get who joined/left to add/remove blips
const handlePlayerCoordsUpdate = (plyCoords: Record<number, Vec3>) => {
  if (!blipsEnabled) return;

  // if player has blip but not in allcoords anymore, player left server so remove blip
  for (const plyId of playersWithBlips) {
    if (plyCoords[plyId]) continue;

    BlipManager.deletePlayerBlip(plyId, 'admin');
    playersWithBlips.delete(plyId);
  }

  // if player is in allcoords but does not have blip, player entered server so add blip
  const ownPlyId = GetPlayerServerId(PlayerId());
  for (const [key, coords] of Object.entries(plyCoords)) {
    const plyId = Number(key);
    if (playersWithBlips.has(plyId) || plyId === ownPlyId) continue;

    BlipManager.addPlayerBlip(
      plyId,
      'admin',
      {
        sprite: 1,
        color: 0,
        heading: true,
        category: 7,
        text: `${getPlayerName(plyId)}(${plyId})`,
      },
      coords
    );
    playersWithBlips.add(plyId);
  }
};

Sync.onPlayerCoordsUpdate(handlePlayerCoordsUpdate);
