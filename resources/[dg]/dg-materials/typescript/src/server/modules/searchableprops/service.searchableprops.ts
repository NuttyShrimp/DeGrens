// This way we save state for other players.
// On client we also keep a list of entityids, this way a client can not move the dumpster to research it.
// He would have to leave so entity despawns, come back and then move it
// When together with 2 players, they could possibly player1 search then move and player2 search but afaik there is no real way to solve this

import { Vector3 } from '@dgx/shared';
import config from 'services/config';

const searchedProps: Record<string, Vec3[]> = {};

export const isSearched = (propType: string, position: Vec3) => {
  const vec = Vector3.create(position);
  return (searchedProps[propType] ??= []).find(d => vec.distance(d) < 0.5) !== undefined;
};

export const setAsSearched = (propType: string, position: Vec3) => {
  (searchedProps[propType] ??= []).push(position);

  // Timeout of same proptype is always same so first item in array is always gonne be oldest
  const timeout = (config.searchableprops[propType]?.timeout ?? 0) * 60 * 1000;
  setTimeout(() => {
    (searchedProps[propType] ??= []).shift();
  }, timeout);
};

export const getSearchablePropsInitData = (): Materials.SearchableProps.InitData => {
  return {
    models: Object.entries(config.searchableprops).reduce<Materials.SearchableProps.InitData['models']>(
      (acc, [propType, { models }]) => {
        acc[propType] = models;
        return acc;
      },
      {}
    ),
  };
};
