export const HACK_LOCATIONS: Record<Laptop.Name, Vec4[]> = {
  laptop_v1: [
    { x: 311.2, y: -284.43, z: 54.56, w: 212.46 },
    { x: 146.93, y: -1046.19, z: 29.77, w: 215.41 },
    { x: -353.86, y: -55.29, z: 49.44, w: 211.58 },
    { x: -1210.81, y: -336.56, z: 38.18, w: 256.21 },
    { x: -2956.47, y: 481.79, z: 16.1, w: 311.63 },
    { x: 1176.04, y: 2712.85, z: 38.49, w: 40.65 },
  ],
  laptop_v2: [],
  laptop_v3: [],
  laptop_v5: [],
};

export const OPENING_DELAY: Partial<Record<Heist.Id, number>> = {
  fleeca_bp: 5 * 60 * 1000,
  fleeca_motel: 1 * 10 * 1000,
  fleeca_benny: 5 * 60 * 1000,
  fleeca_lifeinvader: 5 * 60 * 1000,
  fleeca_highway: 5 * 60 * 1000,
  fleeca_sandy: 5 * 60 * 1000,
};
