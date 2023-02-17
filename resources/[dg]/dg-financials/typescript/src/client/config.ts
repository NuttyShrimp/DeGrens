interface IConfigLocation {
  id: string;
  name: string;
  center: Vec3;
  heading: number;
}

interface IConfig {
  location: {
    width: number;
    length: number;
    list: IConfigLocation[];
  };
  ATMModels: string[];
  ATMZones: Vec3[];
  animText: {
    open: string;
    close: string;
  };
}

export const config: IConfig = {
  location: {
    length: 6.2,
    width: 1.4,
    list: [
      {
        id: 'fleeca_bp',
        name: 'Legion Square',
        center: { x: 149.52, y: -1040.32, z: 29.37 },
        heading: 70,
      },
      {
        id: 'fleeca_motel',
        name: 'Pinkcage hotel',
        center: { x: 313.72, y: -278.67, z: 54.17 },
        heading: 70,
      },
      {
        id: 'fleeca_benny',
        name: 'Hawick Ave',
        center: { x: -351.44, y: -49.43, z: 49.04 },
        heading: 71,
      },
      {
        id: 'fleeca_lifeinvader',
        name: 'Del Perro Blvd',
        center: { x: -1213.35, y: -330.73, z: 37.79 },
        heading: 117,
      },
      {
        id: 'fleeca_highway',
        name: 'Great Ocean Hwy',
        center: { x: -2962.85, y: 482.35, z: 15.7 },
        heading: -3,
      },
      {
        id: 'fleeca_sandy',
        name: 'Sandy Shores',
        center: { x: 1175.65, y: 2706.53, z: 38.09 },
        heading: 90,
      },
      {
        id: 'paleto',
        name: 'Blaine County Savings Bank',
        center: { x: -107.94, y: 6470.59, z: 31.63 },
        heading: 135,
      },
      {
        id: 'pacific',
        name: 'Pacific Standard',
        center: { x: 267.68, y: 217.69, z: 106.28 },
        heading: 160,
      },
      {
        id: 'maze',
        name: 'Maze Bank',
        center: { x: -1308.5, y: -823.89, z: 17.15 },
        heading: 150,
      },
    ],
  },
  ATMModels: ['prop_atm_01', 'prop_atm_02', 'prop_atm_03', 'prop_fleeca_atm'],
  ATMZones: [
    { x: 147.4892, y: -1036.02, z: 29.5057 },
    { x: 145.9324, y: -1035.453, z: 29.5138 },
    { x: 239.0557, y: 212.3731, z: 106.5308 },
    { x: 239.49, y: 213.5663, z: 106.491 },
    { x: 239.9143, y: 214.7322, z: 106.446 },
    { x: 240.3566, y: 215.9474, z: 106.438 },
    { x: 241.3997, y: 218.8133, z: 106.4164 },
    { x: 241.8771, y: 220.1251, z: 106.4767 },
    { x: 242.302, y: 221.2925, z: 106.435 },
    { x: 242.7707, y: 222.5802, z: 106.4522 },
  ],
  animText: {
    open: 'Kaart lezen...',
    close: 'Kaart uithalen...',
  },
};
