export interface SpawnState {
  show: boolean;
  locations: SpawnLocation[];
}

export const spawnState = {
  namespaced: true,
  state: {
    show: false,
    locations: [],
  },
  mutations: {
    setShow(state: SpawnState, show: boolean) {
      state.show = show;
    },
    setLocations(state: SpawnState, locations: SpawnLocation[]) {
      state.locations = locations;
    },
  },
};
