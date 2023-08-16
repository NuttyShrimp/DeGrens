import { BlipManager, PolyZone } from '@dgx/client';

const gasStationZones: {
  center: Vec3;
  heading: number;
  width: number;
  length: number;
  minZ: number;
  maxZ: number;
  type: Vehicle.VehicleType;
}[] = [
  {
    center: {
      x: -723.56,
      y: -935.47,
      z: 18.32,
    },
    length: 15.0,
    width: 30.0,
    heading: 0,
    minZ: 17.92,
    maxZ: 22.72,
    type: 'land',
  },
  {
    center: {
      x: -525.57,
      y: -1210.6,
      z: 17.9,
    },
    length: 19.2,
    width: 17.2,
    heading: 335,
    minZ: 17.1,
    maxZ: 22.5,
    type: 'land',
  },
  {
    center: {
      x: 265.75,
      y: -1260.9,
      z: 29.17,
    },
    length: 20.6,
    width: 29.4,
    heading: 0,
    minZ: 28.17,
    maxZ: 34.97,
    type: 'land',
  },
  {
    center: {
      x: -70.29,
      y: -1761.6,
      z: 28.51,
    },
    length: 14.8,
    width: 28.0,
    heading: 340,
    minZ: 27.71,
    maxZ: 34.31,
    type: 'land',
  },
  {
    center: {
      x: 818.94,
      y: -1029.12,
      z: 26.75,
    },
    length: 10.8,
    width: 25.2,
    heading: 0,
    minZ: 25.15,
    maxZ: 32.75,
    type: 'land',
  },
  {
    center: {
      x: 1208.64,
      y: -1402.19,
      z: 35.23,
    },
    length: 12.4,
    width: 17.2,
    heading: 315,
    minZ: 34.03,
    maxZ: 41.63,
    type: 'land',
  },
  {
    center: {
      x: 1181.01,
      y: -330.15,
      z: 68.98,
    },
    length: 29.2,
    width: 14.0,
    heading: 10,
    minZ: 67.98,
    maxZ: 72.98,
    type: 'land',
  },
  {
    center: {
      x: -1437.09,
      y: -276.57,
      z: 46.26,
    },
    length: 16.8,
    width: 22.2,
    heading: 310,
    minZ: 44.86,
    maxZ: 51.26,
    type: 'land',
  },
  {
    center: {
      x: -2096.61,
      y: -319.13,
      z: 13.04,
    },
    length: 23.0,
    width: 27.6,
    heading: 354,
    minZ: 12.04,
    maxZ: 16.64,
    type: 'land',
  },
  {
    center: {
      x: 621.16,
      y: 268.89,
      z: 103.06,
    },
    length: 16.4,
    width: 27.2,
    heading: 0,
    minZ: 102.06,
    maxZ: 106.06,
    type: 'land',
  },
  {
    center: {
      x: -1799.75,
      y: 803.08,
      z: 138.33,
    },
    length: 16.2,
    width: 29.6,
    heading: 43,
    minZ: 137.13,
    maxZ: 142.53,
    type: 'land',
  },
  {
    center: {
      x: 2580.93,
      y: 361.91,
      z: 108.46,
    },
    length: 17.0,
    width: 26.4,
    heading: 357,
    minZ: 107.46,
    maxZ: 110.46,
    type: 'land',
  },
  {
    center: {
      x: 2537.01,
      y: 2593.71,
      z: 37.94,
    },
    length: 8.0,
    width: 4.8,
    heading: 19,
    minZ: 36.94,
    maxZ: 40.94,
    type: 'land',
  },
  {
    center: {
      x: 1207.6,
      y: 2660.15,
      z: 37.81,
    },
    length: 10,
    width: 9.4,
    heading: 315,
    minZ: 36.81,
    maxZ: 40.81,
    type: 'land',
  },
  {
    center: {
      x: 263.83,
      y: 2606.89,
      z: 44.98,
    },
    length: 9.2,
    width: 9.4,
    heading: 10,
    minZ: 43.98,
    maxZ: 47.98,
    type: 'land',
  },
  {
    center: {
      x: 50.27,
      y: 2779.43,
      z: 57.88,
    },
    length: 10,
    width: 10,
    heading: 323,
    minZ: 56.88,
    maxZ: 60.88,
    type: 'land',
  },
  {
    center: {
      x: -2555.11,
      y: 2334.37,
      z: 33.06,
    },
    length: 27.4,
    width: 17.0,
    heading: 4,
    minZ: 32.06,
    maxZ: 36.66,
    type: 'land',
  },
  {
    center: {
      x: 1785.25,
      y: 3330.86,
      z: 41.06,
    },
    length: 7.8,
    width: 8.0,
    heading: 30,
    minZ: 40.06,
    maxZ: 44.06,
    type: 'land',
  },
  {
    center: {
      x: 2679.54,
      y: 3264.4,
      z: 55.24,
    },
    length: 10.8,
    width: 10.2,
    heading: 331,
    minZ: 54.04,
    maxZ: 59.24,
    type: 'land',
  },
  {
    center: {
      x: 1687.42,
      y: 4929.5,
      z: 42.09,
    },
    length: 9.2,
    width: 15.0,
    heading: 325,
    minZ: 41.09,
    maxZ: 45.09,
    type: 'land',
  },
  {
    center: {
      x: 1701.72,
      y: 6416.49,
      z: 32.6,
    },
    length: 12.2,
    width: 14.4,
    heading: 335,
    minZ: 31.6,
    maxZ: 35.6,
    type: 'land',
  },
  {
    center: {
      x: 180.16,
      y: 6603.01,
      z: 31.85,
    },
    length: 15.2,
    width: 26.0,
    heading: 10,
    minZ: 30.85,
    maxZ: 36.05,
    type: 'land',
  },
  {
    center: {
      x: -94.42,
      y: 6419.7,
      z: 31.49,
    },
    length: 11.2,
    width: 15.8,
    heading: 45,
    minZ: 30.29,
    maxZ: 34.89,
    type: 'land',
  },
  {
    center: { x: 2006.37, y: 3773.87, z: 32.18 },
    length: 9.4,
    width: 17.0,
    heading: 30,
    minZ: 30.98,
    maxZ: 36.98,
    type: 'land',
  },
  {
    center: { x: -319.85, y: -1471.37, z: 30.55 },
    length: 16.2,
    width: 30.4,
    heading: 30,
    minZ: 28.55,
    maxZ: 34.98,
    type: 'land',
  },
  {
    center: { x: 810.19, y: -789.76, z: 26.21 },
    length: 8.8,
    width: 13.2,
    heading: 0,
    minZ: 25.11,
    maxZ: 29.31,
    type: 'land',
  },
  {
    center: {
      x: -1113.01,
      y: -2883.5,
      z: 13.94,
    },
    width: 16.4,
    length: 15.2,
    heading: 330,
    minZ: 12.94,
    maxZ: 19.34,
    type: 'air',
  },
  {
    center: {
      x: -1145.88,
      y: -2864.46,
      z: 13.95,
    },
    width: 16.14,
    length: 16.34,
    heading: 330,
    minZ: 12.94,
    maxZ: 19.34,
    type: 'air',
  },
  {
    center: {
      x: -1178.4,
      y: -2845.72,
      z: 13.95,
    },
    width: 16.4,
    length: 16.4,
    heading: 330,
    minZ: 12.94,
    maxZ: 19.34,
    type: 'air',
  },
  {
    center: {
      x: 481.84,
      y: -982.26,
      z: 41.01,
    },
    width: 11.0,
    length: 10.6,
    heading: 0,
    minZ: 39.69,
    maxZ: 44.49,
    type: 'air',
  },
  {
    center: {
      x: 352.13,
      y: -587.88,
      z: 74.16,
    },
    width: 15.0,
    length: 15.0,
    heading: 0,
    minZ: 73.16,
    maxZ: 77.16,
    type: 'air',
  },
  {
    center: {
      x: 1770.37,
      y: 3239.77,
      z: 42.14,
    },
    width: 16.2,
    length: 17.0,
    heading: 14,
    minZ: 41.14,
    maxZ: 45.54,
    type: 'air',
  },
  {
    center: {
      x: 1853.12,
      y: 3706.09,
      z: 33.97,
    },
    width: 14.0,
    length: 14.0,
    heading: 30,
    minZ: 32.97,
    maxZ: 38.57,
    type: 'air',
  },
  {
    center: {
      x: -475.18,
      y: 5988.49,
      z: 31.34,
    },
    width: 17.6,
    length: 18.4,
    heading: 315,
    minZ: 30.34,
    maxZ: 36.34,
    type: 'air',
  },

  {
    center: {
      x: 175.78,
      y: -1561.79,
      z: 29.26,
    },
    width: 18.0,
    length: 20.2,
    heading: 45,
    minZ: 28.26,
    maxZ: 32.26,
    type: 'land',
  },
];

let inZone = false;

export const isInZone = (): boolean => {
  return inZone;
};

setImmediate(() => {
  gasStationZones.forEach((zone, idx) => {
    PolyZone.addBoxZone('gasstation', zone.center, zone.width, zone.length, {
      minZ: zone.minZ,
      maxZ: zone.maxZ,
      // For some reason are our heading shifter quarter of a circle
      heading: zone.heading + 90,
      data: {
        id: idx,
      },
    });
    BlipManager.addBlip({
      category: 'dg-vehicles',
      id: `station-${idx}`,
      text: 'Tankstation',
      coords: zone.center,
      sprite: 361,
      color: 1,
      scale: 0.6,
    });
  });
  PolyZone.onEnter('gasstation', () => {
    inZone = true;
  });
  PolyZone.onLeave('gasstation', () => {
    inZone = false;
  });
});
