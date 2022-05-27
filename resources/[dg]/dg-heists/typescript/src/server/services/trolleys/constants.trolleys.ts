const fleecaLoot: Trolley.Loot = {
  types: {
    cash: [{ name: 'markedbills', min: 75, max: 125 }],
    gold: [{ name: 'gold_bar', min: 2, max: 5 }],
  },
  specialChance: 25,
  specialItems: ['drive_v2'],
};
const paletoLoot: Trolley.Loot = {
  types: {
    cash: [{ name: 'markedbills', min: 75, max: 125 }],
    gold: [{ name: 'gold_bar', min: 2, max: 5 }],
  },
  specialChance: 20,
  specialItems: ['drive_v5'],
};
const mazeLoot: Trolley.Loot = {
  types: {
    cash: [{ name: 'markedbills', min: 75, max: 125 }],
    gold: [{ name: 'gold_bar', min: 2, max: 5 }],
  },
  specialChance: 20,
  specialItems: ['drive_v5'],
};
const pacificLoot: Trolley.Loot = {
  types: {
    cash: [{ name: 'markedbills', min: 75, max: 125 }],
    gold: [{ name: 'gold_bar', min: 2, max: 5 }],
  },
  specialChance: 10,
  specialItems: ['drive_v10'],
};

export const TROLLEY_LOOT: Partial<Record<Heist.Id, Trolley.Loot>> = {
  fleeca_bp: fleecaLoot,
  fleeca_motel: fleecaLoot,
  fleeca_benny: fleecaLoot,
  fleeca_lifeinvader: fleecaLoot,
  fleeca_highway: fleecaLoot,
  fleeca_sandy: fleecaLoot,
  paleto: paletoLoot,
  maze: mazeLoot,
  pacific: pacificLoot,
};
