import { Events } from '@dgx/server';
import { ARENA_TYPES, ARENA_COORDS, ARENA_IPL } from './constants.arena';

type ArenaType = keyof typeof ARENA_TYPES;

let currentType: ArenaType | null;

const buildCurrentInteriorData = (): Arena.Interior | undefined => {
  if (currentType === null) return;

  const arenaType = ARENA_TYPES[currentType];
  if (!arenaType) return;

  return {
    ipl: ARENA_IPL,
    coords: ARENA_COORDS,
    type: arenaType,
  };
};

export const getArenaTypes = () => {
  return Object.keys(ARENA_TYPES) as ArenaType[];
};

export const setCurrentArenaType = (type: ArenaType | null) => {
  currentType = type;
  dispatchInteriorToClients();
};

export const dispatchInteriorToClients = (target = -1) => {
  const interior = buildCurrentInteriorData();
  Events.emitNet('misc:arena:setInterior', target, interior);
};
