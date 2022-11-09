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
}

declare interface Config {
  DefaultSpawn: Vector;
  MaxPlayers: number;
  Player: PlayerConfig;
  Money: MoneyConfig;
  Server: ServerConfig;
}

declare interface PlayerConfig {
  HungerRate: number;
  ThirstRate: number;
  JSONData: string[];
}

declare interface ServerConfig {
  discord: string;
}

declare interface MoneyConfig {
  defaultCash: number;
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
  license: string;
  steamid: string;
  charinfo: CharacterInfo;
  name: string;
  citizenid: number;
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
  card?: string | number;
}

declare interface Grade {
  name: string;
  level: number;
}
