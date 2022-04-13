declare interface Shared {
  /**
   * QBCore.Shared.RandomStr
   * @param {number} length: length of the random string
   * @returns {string} string of random characters of the given length
   */
  RandomStr(length: number): string;

  /**
   * QBCore.Shared.RandomInt
   * @param {number} length: length of the random integer
   * @returns {number} random integer of the given length
   */
  RandomInt(length: number): number;

  /**
   * QBCore.Shared.SplitStr
   * @param {string} str: string to split
   * @param {string} delimiter: point at which to split the string
   * @returns {string[]} array containing the two halves of the split string
   */
  SplitStr(str: string, delimiter: string): string[];

  /**
   * QBCore.Shared.GetTableDiff
   * Get the difference between two tables
   * @param tbl1
   * @param tbl2
   */
  GetTableDiff(
    tbl1: object,
    tbl2: object
  ): {
    added: object;
    removed: object;
  };

  /**
   * QBCore.Shared.isDiff
   * Check if values are different
   * @param v1
   * @param v2
   */
  isDiff(v1: any, v2: any): boolean;

  Weapons: {
    [key: number]: Weapon;
  };
  Vehicles: {
    [key: string]: Vehicle;
  };
  Gangs: {
    [key: string]: {
      label: string;
      grades: {
        [key: string]: {
          name: string;
          isboss?: boolean;
        };
      };
    };
  };
  Jobs: {
    [key: string]: {
      label: string;
      defaultDuty: boolean;
      grades: {
        [key: string]: {
          name: string;
          payment: number;
          isboss?: boolean;
        };
      };
    };
  };
  StarterItems: {
    [key: string]: {
      amount: number;
      name: string;
    };
  };
}

declare interface Config {
  DefaultSpawn: Vector;
  MaxPlayers: number;
  Player: PlayerConfig;
  Money: MoneyConfig;
  Server: ServerConfig;
}

declare interface PlayerConfig {
  MaxWeight: number;
  BloodTypes: BloodTypes;
  MaxInvSlots: number;
  HungerRate: number;
  ThirstRate: number;
  JSONData: string[];
}

declare interface ServerConfig {
  uptime: number;
  whitelist: boolean;
  closed: boolean;
  PermissionList: any;
  closedReason: string;
  discord: string;
}

declare interface MoneyConfig {
  PayCheckTimeOut: number;
  defaultCash: number;
}

declare type BloodTypes = 'A+' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

declare interface Item {
  type: 'weapon' | 'item';
  name: string;
  weight: number;
  label: string;
  image: string;
  shouldClose: boolean;
  combinable?: ItemCombinable;
  description: string;
  info?: any;
  amount?: any;
  createtime: number;
  decayrate: number;
  slot: number;
  usable: boolean;
  stackable: boolean;
  quality: number;
}

declare interface ItemCombinableAnim {
  dict: string;
  lib: string;
  text: string;
  timeOut: number;
}

declare interface ItemCombinable {
  accept: string[];
  reward: string;
  anim: ItemCombinableAnim;
}

declare interface Weapon {
  name: string;
  label: string;
  weight: number;
  type: 'weapon' | 'item';
  ammotype?: string;
  image: string;
  unique: boolean;
  usable: boolean;
  description: string;
}

declare interface Vehicle {
  name: string;
  brand: string;
  model: string;
  price: number;
  category: string;
  hash: number;
  shop: string;
}

declare interface Vector {
  x: number;
  y: number;
  z: number;
  w?: number; // heading
}

declare interface MetaData {
  [key: string]: any;
}

declare interface PlayerData {
  position: Vector;
  source: number;
  cid: number;
  license: string;
  steamid: string;
  charinfo: CharacterInfo;
  job: Job;
  gang: Gang;
  name: string;
  citizenid: number;
  LoggedIn: boolean;
  items: Item[];
  inventory: string; // Appears to be JSON serialised version of items
  metadata: MetaData;
}

declare interface CharacterInfo {
  firstname: string;
  lastname: string;
  cash: number;
  birthdate: string;
  phone: number;
  nationality: string;
  gender: number;
  cid: string;
  backstory: string; // Unused but is part of the interface
  card?: string | number;
}

declare interface Grade {
  name: string;
  level: number;
}

declare interface Gang {
  isboss?: boolean;
  name: string;
  label: string;
  grade: Grade;
}

declare interface Job {
  isboss?: boolean;
  name: string;
  label: string;
  grade: Grade;
  onduty: boolean;
  payment: number;
}
