export const STATE_WEIGHTS: Record<Hospital.State, number> = {
  alive: 0,
  unconscious: 1,
  dead: 2,
};

export const DOWN_ANIMATIONS: Record<Hospital.DownType | 'vehicle', { animDict: string; anim: string; flag: number }> =
  {
    unconscious: {
      animDict: 'dead',
      anim: 'dead_c',
      flag: 1,
    },
    dead: {
      animDict: 'dead',
      anim: 'dead_h',
      flag: 1,
    },
    vehicle: {
      animDict: 'veh@low@front_ps@base',
      anim: 'die',
      flag: 2,
    },
  };

export const ENABLED_CONTROLS = [0, 1, 2, 3, 4, 5, 6, 46, 249, 200];

export const TEXT_COLORS = {
  white: {
    r: 255,
    g: 255,
    b: 255,
  },
  green: {
    r: 0,
    g: 255,
    b: 0,
  },
  red: {
    r: 255,
    g: 0,
    b: 0,
  },
};

// Vehicles classes you dont get tped back into on death
export const NO_TP_VEHICLE_CLASSES = [8, 13];
