import { Auth, Police, Util } from '@dgx/server';

import { getPlayerRole, hasRoleAccess } from '../permissions/service.permissions';

export const commands: CommandData[] = [];

const interactingPlayersForPlayer: Record<number, number[]> = {};

const generateCaller = (source: number): UserData => {
  return {
    source,
    name: GetPlayerName(String(source)),
    cid: Player(source).state.cid ?? 0,
    steamId: Player(source).state.steamId,
  };
};

const getCommandHandler = (src: number, cmd: string) => {
  const command = commands.find(c => c.name === cmd);
  if (!command) return;
  if (!command.handler) return;
  const caller = generateCaller(src);
  Util.Log(
    `admin:command:${command.name}`,
    {
      command: cmd,
    },
    `${caller.name} executed following admin command ${command.name}`,
    src
  );
  command.handler(caller);
};

export const loadCommands = () => {
  const importAll = (r: __WebpackModuleApi.RequireContext) => {
    r.keys().forEach(key => {
      const newCommands: Record<string, CommandData> = r(key);
      Object.values(newCommands).forEach(command => commands.push(command));
    });
  };
  importAll(require.context('./data', false, /\.ts$/));
};

export const getUICommands = (src: number): CommandData[] => {
  const plyRole = getPlayerRole(src);
  return commands.filter(c => c.UI && Object.keys(c.UI).length > 1 && hasRoleAccess(plyRole, c.role));
};

// Allow invisibity for players that are in vehicle or attached to person that is invisible
// If is false, disallow cached interactionPlayers
export const allowInvisibleForInteractingPlayers = (plyId: number, allow: boolean) => {
  if (!allow) {
    const interactingPlayers = interactingPlayersForPlayer[plyId] ?? [];
    interactingPlayers.forEach(plyId => {
      Auth.toggleAllowedMod(plyId, 'invisible', false);
    });
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

  interactingPlayers.forEach(plyId => {
    Auth.toggleAllowedMod(plyId, 'invisible', true);
  });
  interactingPlayersForPlayer[plyId] = interactingPlayers;
};
