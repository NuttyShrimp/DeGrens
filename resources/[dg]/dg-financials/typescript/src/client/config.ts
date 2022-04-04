import { Vec3 } from '@ts-shared/shared/classes/vector3';

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
        center: { x: -112.88, y: 6469.37, z: 31.63 },
        heading: 45,
      },
      {
        id: 'pacific',
        name: 'Pacific Standard',
        center: { x: 242.07, y: 224.51, z: 106.29 },
        heading: 70,
      },
    ],
  },
  ATMModels: ['prop_atm_01', 'prop_atm_02', 'prop_atm_03', 'prop_fleeca_atm'],
  animText: {
    open: 'Kaart lezen...',
    close: 'Kaart uithalen...',
  },
};
