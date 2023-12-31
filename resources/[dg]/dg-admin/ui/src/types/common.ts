export type MenuTab = 'actions' | 'players';

export interface BaseAction {
  name: string;
  title: string;
}

export interface Action extends BaseAction {
  favorite: boolean;
  toggled?: boolean;
  bindable?: boolean;
  info?: {
    inputs?: string[];
    overrideFields?: string[];
    checkBoxes?: string[];
  };
}

export interface Player {
  name: string;
  cid: number;
  serverId: number;
  steamId: string;
  firstName: string;
  lastName: string;
  points: string;
}

export interface Vehicle {
  name: string;
  brand: string;
  model: string;
  class: string;
}

export interface RoutingBucket {
  name: string;
  id: number;
}

export interface BankAccount {
  name: string;
  type: string;
  owner: string;
  id: string;
}

export interface WhitelistedJob {
  name: string;
  ranks: number;
}

export interface PlayerData {
  bucketId: number;
}

export interface Item {
  name: string;
  label: string;
  size: {
    x: number;
    y: number;
  };
}

export interface WeatherType {
  name: string;
}

export interface Gang {
  name: string;
  label: string;
  owner: number;
}
