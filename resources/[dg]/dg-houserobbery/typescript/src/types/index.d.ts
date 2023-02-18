declare namespace House {
  interface Data {
    coords: Vec4;
    size: Interior.Size;
  }

  interface State<E> {
    searched: Set<string>;
    // All players that have entered the house
    players: Set<number>;
    dataIdx: number;
    state: E;
  }
}

declare namespace Interior {
  type Size = 'small' | 'medium' | 'big';

  interface Data {
    shell: string;
    exit: {
      offset: Vec3;
      heading: number;
    };
    lootables: { model: number; item?: string }[];
  }
}

declare interface Config {
  // Used if we want to specify specific loot at a spot
  // Will default to index 0 if not specified
  lootTables: string[][];
  // Time in minutes after a ply finished/failed a job that it cannot get any jobs
  playerCooldown: number;
  // Time in minutes a player can enter a house after it first interaction
  timeToRob: number;
  // Time in minutes to find and try to interact with a house
  timeToFind: number;
  shellType: Record<string, string>;
  locations: House.Data[];
  moldChance: number;
}
