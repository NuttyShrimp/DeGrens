declare interface InteractionZone {
  offset: Vec3;
  dist: number;
  // suffix of zone name
  name: string;
  GeneralUse: {
    label: string;
    isServer?: boolean;
    event: string;
  };
  housingMain?: {
    label: string;
    isServer?: boolean;
    event: string;
  };
  housingSecondary?: {
    label: string;
    isServer?: boolean;
    event: string;
  };
}

declare namespace Peek {
  type EntryType = 'model' | 'entity' | 'bones' | 'flags' | 'global';

  interface Entry {
    type: EntryType;
    id: string | number | (string | number)[];
    distance: number;
    options: (EventOption | FunctionOption | AllOption)[];
  }

  interface BoxZone {
    entries: Omit<Entry, 'type' | 'id'>;
    offset: Vec3;
    width: number;
    length: number;
    options: {
      data: { [key: string]: any };
      heading?: number;
      minZ?: number;
      maxZ?: number;
    };
  }

  interface CircleZone {
    entries: Omit<Entry, 'type' | 'id'>;
    offset: Vec3;
    radius: number;
    options: {
      useZ?: boolean;
      data: { [key: string]: any };
    };
  }
}

declare interface Buildplan {
  shell: string;
  saveToCache: boolean;
  // Is shell somewhere placed on the map where we can preload it?
  origin: Vec3 | false;
  // Random location where a duplicate of the instance will be copied to
  generator?: Vec3;
  spawnOffset: Vec4;
  modulo?: {
    multi: Coords;
    xLimit: number;
    yLimit: number;
  };
  offsetX?: {
    num: number;
    multi: number;
  };
  offsetY?: {
    num: number;
    multi: number;
  };
  offsetZ?: {
    num: number;
    multi: number;
  };
  // Normal polyzone
  interactZone?: InteractionZone[];
  // Polytarget with peek entries
  targetZone?: (Peek.BoxZone | Peek.CircleZone)[];
  // Peekentries
  peek?: Peek.Entry[];
}
