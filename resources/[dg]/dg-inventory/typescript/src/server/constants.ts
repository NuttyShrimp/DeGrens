// Workaround to ensure every type from Inventory.Type is in this array
// this way when we add new type it will throw a build error if we forgots to add here
const types: Record<Inventory.Type, true> = {
  player: true,
  trunk: true,
  glovebox: true,
  drop: true,
  dumpster: true,
  stash: true,
  shop: true,
  container: true,
  tunes: true,
  bench: true,
};

export const INVENTORY_TYPES = Object.keys(types) as Inventory.Type[];
