import { Auth, Police, Util } from '@dgx/server';

import { getPlayerRole, hasRoleAccess } from '../permissions/service.permissions';

// @ts-ignore
import { entries as cmdArray } from './data/*.ts';

export const commands: CommandData[] = [];

const interactingPlayersForPlayer: Record<number, number[]> = {};

export const loadCommands = () => {
  const importAll = (r: [string, any][]) => {
    r.forEach(([_, cmdData]) => {
      Object.values(cmdData).forEach(command => commands.push(command as CommandData));
    });
  };
  importAll(cmdArray);
};

export const getUICommands = (src: number): CommandData[] => {
  const plyRole = getPlayerRole(src);
  return commands.filter(c => c.UI && Object.keys(c.UI).length > 1 && hasRoleAccess(plyRole, c.role));
};

// Allow invisibity for players that are in vehicle or attached to person that is invisible
// If is false, disallow cached interactionPlayers
export const allowInvisibleForInteractingPlayers = async (plyId: number, allow: boolean) => {
  if (!allow) {
    const interactingPlayers = interactingPlayersForPlayer[plyId] ?? [];
    await Promise.all(
      interactingPlayers.map(plyId => {
        return Auth.toggleAllowedMod(plyId, 'invisible', false);
      })
    );
    delete interactingPlayersForPlayer[plyId];
    return;
  }

  const interactingPlayers: number[] = [];

  const originPed = GetPlayerPed(String(plyId));
  const vehicle = GetVehiclePedIsIn(originPed, false);
  if (vehicle) {
    Util.getPlayersInVehicle(vehicle).forEach(plyId => interactingPlayers.push(plyId));
  }
  const carriedPlayer = Police.getPlayerBeingCarried(plyId);
  if (carriedPlayer) {
    interactingPlayers.push(carriedPlayer);
  }
  const escortedPlayer = Police.getPlayerBeingEscorted(plyId);
  if (escortedPlayer) {
    interactingPlayers.push(escortedPlayer);
  }

  await Promise.all(
    interactingPlayers.map(plyId => {
      return Auth.toggleAllowedMod(plyId, 'invisible', true);
    })
  );
  interactingPlayersForPlayer[plyId] = interactingPlayers;
};
