// This way we save state for other players.
// On client we also keep a list of entityids, this way a client can not move the dumpster to research it.
// He would have to leave so entity despawns, come back and then move it
// When together with 2 players, they could possibly player1 search then move and player2 search but afaik there is no real way to solve this

import { Vector3 } from '@dgx/shared';
import { getConfig } from 'services/config';

const searchedDumpsters: Vec3[] = [];

export const isSearched = (position: Vec3) => {
  const vec = Vector3.create(position);
  return searchedDumpsters.find(d => vec.distance(d) < 0.5) !== undefined;
};

export const setAsSearched = (position: Vec3) => {
  searchedDumpsters.push(position);

  // Timeout is always same so first item in array is always gonne be oldest
  const timeout = getConfig().dumpsters.refillTime * 60 * 1000;
  setTimeout(() => {
    searchedDumpsters.shift();
  }, timeout);
};
