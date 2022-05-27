export const TROLLEY_OBJECTS: Record<Trolley.Type, { trolley: number; pickup: number }> = {
  cash: {
    trolley: GetHashKey('ch_prop_ch_cash_trolly_01c'),
    pickup: GetHashKey('hei_prop_heist_cash_pile'),
  },
  gold: {
    trolley: GetHashKey('ch_prop_gold_trolly_01c'),
    pickup: GetHashKey('ch_prop_gold_bar_01a'),
  },
  diamonds: {
    trolley: GetHashKey('ch_prop_diamond_trolly_01c'),
    pickup: GetHashKey('ch_prop_vault_dimaondbox_01a'),
  },
};

export const TROLLEY_LOCATIONS: Partial<Record<Heist.Id, Trolley.Data[]>> = {
  fleeca_bp: [
    {
      coords: { x: 147.18, y: -1049.36, z: 29.35, w: 352.19 },
      spawnChance: 100,
      type: 'cash',
    },
    {
      coords: { x: 149.97, y: -1050.53, z: 29.35, w: 338.45 },
      spawnChance: 10,
      type: 'gold',
    },
  ],
  fleeca_motel: [
    {
      coords: { x: 311.43, y: -288.02, z: 54.14, w: 347.25 },
      spawnChance: 100,
      type: 'cash',
    },
    {
      coords: { x: 314.25, y: -288.87, z: 54.14, w: 342.72 },
      spawnChance: 10,
      type: 'gold',
    },
  ],
  fleeca_benny: [
    {
      coords: { x: -353.53, y: -58.87, z: 49.01, w: 346.94 },
      spawnChance: 100,
      type: 'cash',
    },
    {
      coords: { x: -350.75, y: -59.45, z: 49.01, w: 338.48 },
      spawnChance: 10,
      type: 'gold',
    },
  ],
  fleeca_lifeinvader: [
    {
      coords: { x: -1208.03, y: -338.83, z: 37.76, w: 31.79 },
      spawnChance: 100,
      type: 'cash',
    },
    {
      coords: { x: -1205.59, y: -337.39, z: 37.76, w: 23.74 },
      spawnChance: 10,
      type: 'gold',
    },
  ],
  fleeca_highway: [
    {
      coords: { x: -2953.39, y: 483.03, z: 15.68, w: 83.16 },
      spawnChance: 100,
      type: 'cash',
    },
    {
      coords: { x: -2953.44, y: 485.98, z: 15.68, w: 89.29 },
      spawnChance: 10,
      type: 'gold',
    },
  ],
  fleeca_sandy: [
    {
      coords: { x: 1174.67, y: 2715.98, z: 38.07, w: 182.62 },
      spawnChance: 100,
      type: 'cash',
    },
    {
      coords: { x: 1171.68, y: 2716.08, z: 38.07, w: 183.64 },
      spawnChance: 10,
      type: 'gold',
    },
  ],
};
