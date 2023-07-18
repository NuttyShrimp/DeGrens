declare namespace Houserobbery {
  type FullConfig = { config: Config } & Locations;

  type Config = {
    // Used if we want to specify specific loot at a spot
    // Will default to index 0 if not specified
    lootTable: Loot[];
    // Time in minutes after a ply finished/failed a job that it cannot get any jobs
    playerCooldown: number;
    // Time in minutes a player can enter a house after it first interaction
    timeToRob: number;
    // Time in minutes to find and try to interact with a house
    timeToFind: number;
    shellInfo: Partial<Record<Interior.Size, Interior.Data>>;
    moldChance: number;
  };

  type Loot = {
    itemName: string;
    weight: number;
    lootTableId: number;
  };

  type Locations = Record<Interior.Size, Vec4[]>;

  type HouseState = {
    searchedZones: Set<string>;
    insidePlayers: Set<number>;
    location: Location;
    locked: boolean;
    groupId: string;
    failTimeout: NodeJS.Timeout;
  };

  namespace Interior {
    type Size = 'small' | 'medium' | 'big';

    interface Data {
      shell: string;
      lootZones: number;
    }
  }

  type Location = {
    coords: Vec4;
    size: Interior.Size;
  };
}
