import {
  Action,
  BankAccount,
  BaseAction,
  Gang,
  Item,
  MenuTab,
  Player,
  PlayerData,
  RoutingBucket,
  Vehicle,
  WeatherType,
  WhitelistedJob,
} from './common';
import { ClassInfo } from './penalty';

export interface DataStore {
  vehicleModels: Vehicle[];
  routingBuckets: RoutingBucket[];
  bankAccounts: BankAccount[];
  whitelistedJobs: WhitelistedJob[];
  playerData: PlayerData;
  items: Item[];
  weatherTypes: WeatherType[];
  gangs: Gang[];
}

export interface PenaltyStore {
  visible: boolean;
  reasons: Record<string, string>;
  classes: Record<string, ClassInfo>;
  currentTarget: Player | null;
}

export interface SelectorStore {
  visible: boolean;
  type: number;
  name: string;
  actions: BaseAction[][];
}

export interface State {
  currentMenu: MenuTab;
  actions: Action[];
  // On who the action are performed. If null is performed on this client side
  // Can be set in players menu
  target: Player | null;
  menuOpen: boolean;
  devMode: boolean;
  players: Player[];
  binds: Record<string, string | null>;
  data?: DataStore;
  penalty?: PenaltyStore;
  selector?: SelectorStore;
}
