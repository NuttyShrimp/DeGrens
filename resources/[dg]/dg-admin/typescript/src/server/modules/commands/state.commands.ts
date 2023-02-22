const PLAYER_STATE_TOGGLE_COMMANDS = {
  cloak: {
    isHidden: true,
  },
  noclip: {
    isHidden: true,
  },
  godmode: {
    isHidden: false,
  },
};

type PlayerStateToggleCommand = keyof typeof PLAYER_STATE_TOGGLE_COMMANDS;

// Map to keep track of toggled commands for every player
const playerCommandStates: Record<number, Record<PlayerStateToggleCommand, boolean>> = {};

export const setPlayerDefaultCommandState = (plyId: number) => {
  playerCommandStates[plyId] = (Object.keys(PLAYER_STATE_TOGGLE_COMMANDS) as PlayerStateToggleCommand[]).reduce(
    (acc, cur) => {
      acc[cur] = false;
      return acc;
    },
    {} as (typeof playerCommandStates)[number]
  );
};

export const getPlayerCommandState = (plyId: number, command: PlayerStateToggleCommand) => {
  return playerCommandStates[plyId]?.[command] ?? false;
};

export const setPlayerCommandState = (plyId: number, command: PlayerStateToggleCommand, state: boolean) => {
  if (!playerCommandStates[plyId]) return;
  playerCommandStates[plyId][command] = state;
};

export const getHiddenPlayers = () => {
  const hiddenPlayers: number[] = [];
  for (const [plyId, playerState] of Object.entries(playerCommandStates)) {
    for (const [command, state] of Object.entries(playerState)) {
      if (!state) continue;
      if (PLAYER_STATE_TOGGLE_COMMANDS[command as PlayerStateToggleCommand].isHidden) {
        hiddenPlayers.push(Number(plyId));
        break;
      }
    }
  }
  return hiddenPlayers;
};

export const isPlayerHidden = (plyId: number) => {
  if (!playerCommandStates[plyId]) return false;

  for (const [command, state] of Object.entries(playerCommandStates[plyId])) {
    if (!state) continue;
    if (PLAYER_STATE_TOGGLE_COMMANDS[command as PlayerStateToggleCommand].isHidden) {
      return true;
    }
  }
};
