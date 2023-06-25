type EntityType = null | 'ped' | 'player' | 'vehicle';

interface Context {
  entity: number;
  netId?: number;
  type: number;
  model: number;
  flags: Set<string>;
  globalType: EntityType;
}

type PeekEntryType = 'model' | 'entity' | 'bones' | 'flags' | 'zones' | 'global';
type PeekValueType = string | number;

interface Option {
  id?: string;
  _metadata?: Record<string, any>;
  disabled?: boolean;
  // The value must be the full name eg. 'fas fa-home'
  icon: string;
  label: string;
  // Array of strings, each string is the name of an item. The player must have all items to be able to see this entry
  items?: string | string[];
  partialItems?: boolean; // if true, the player only needs to have one of the items provided
  // This will be called each time the target is valid for this entry
  // This means no expensive operations should be done here
  canInteract?: (entity: number | undefined, distance: number, data: Option) => boolean | Promise<boolean>;
  job?:
    | string
    | string[]
    | {
        // The number is the minimum grade the player needs to have
        [jobName: string]: number;
      };
  gang?: string | string[];
  // Array of whitelisted business options, when only businessname then every employee can do, else also check perms
  business?: { name: string; permissions?: string[] }[];
  // If the dist for this option is diff fron the parameters one
  distance?: number;
  // Tie extract info to the option if needed
  data?: any;
  // Allow option to be viewed while player is inside vehicle
  allowInVehicle?: boolean;
}

interface EventOption extends Option {
  type: 'client' | 'server';
  event: string;
}

interface FunctionOption extends Option {
  action: (data: Option, entity: number | undefined) => void;
}

type PeekOption = EventOption | FunctionOption;

interface EntryAddParameter {
  options: PeekOption[];
  distance?: number;
}

interface IEntryManager {
  getEntry(key: PeekValueType): PeekOption | undefined;

  addEntry(key: PeekValueType, info: EntryAddParameter): string[];

  removeEntry(id: string): void;

  loadActiveEntries(ctx?: Context): void;

  getActiveEntries(): PeekOption[];

  clearActiveEntries(): void;
}

interface PeekEntity {
  entity: number;
  coords: Vec3;
}
