import { Store } from 'vuex';

import { Action, Player, Vehicle } from '../types/common';
import { ClassInfo } from '../types/penalty';
import { State } from '../types/state';

export const devData: Record<string, any> = {};

devData.actions = [
  {
    name: 'vehrepair',
    title: 'Fix vehicle',
  },
  {
    name: 'bring',
    title: 'Bring',
    info: {
      inputs: ['Target', 'Vehicle'],
    },
  },
  {
    name: 'tp',
    title: 'TP',
    info: {
      inputs: ['Target'],
    },
  },
  {
    name: 'tpcoords',
    title: 'TP to coordinates',
    info: {
      inputs: [],
      overrideFields: ['x', 'y', 'z', 'vector'],
    },
  },
  {
    name: 'godmode',
    title: 'Godmode',
    toggled: true,
    favorite: true,
    bindable: true,
  },
  {
    name: 'invisible',
    title: 'Invisible',
    toggled: false,
  },
] as Action[];

devData.players = [
  {
    name: 'Pieter',
    steamId: 'steam:11000010119ac2a',
    serverId: 30,
    cid: 1001,
    firstName: 'pieter',
    lastName: 'Dev',
  },
  {
    name: 'DEZZ',
    steamId: 'steam:110000102a65b5e',
    serverId: 31,
    cid: 1002,
    firstName: 'Vin(nie)',
    lastName: 'Diesel',
  },
  {
    name: 'Fetty_D',
    steamId: 'steam:11000010ab0eb9a',
    serverId: 37,
    cid: 1003,
    firstName: 'Mazout',
    lastName: 'Gas',
  },
] as Player[];

devData.vehModels = [
  {
    name: 'Adder',
    model: 'adder',
  },
  {
    name: 'WRX STi',
    model: 'subwrx',
  },
  {
    name: 'DB11',
    model: 'db11',
  },
] as Vehicle[];

devData.classes = {
  A: {
    length: 1,
    points: 10,
  },
  B: {
    length: 3,
    points: 15,
  },
} as Record<string, ClassInfo>;

devData.reasons = {
  'Onnodig OOC gaan': 'A',
  'Misbruik van het /OOC systeem': 'B',
  'Meta gaming': 'D',
  'Power gaming': 'A',
  'Fail RP': 'C',
  'RDM/VDM': 'B',
} as Record<string, string>;

devData.selectorActions = [
  [
    {
      name: 'damageEntity',
      title: 'Damage entity',
    },
    {
      name: 'revive',
      title: 'Revive',
    },
    {
      name: 'attach',
      title: 'Attach',
    },
    {
      name: 'kick',
      title: 'Kick',
    },
  ],
  [],
  [],
  [],
];

export const devDataPlugin = (store: Store<State>) => {
  // Do not run if env is production
  if (import.meta.env.PROD) return;
  store.commit('setMenuVisible', true);
  store.commit('setActions', devData.actions);
  store.commit('setPlayers', devData.players);
  store.commit('data/setVehicleModels', devData.vehModels);
  // store.commit('penalty/setTarget', devData.players[0]);
  // store.commit('penalty/setInfo', {
  //   classes: devData.classes,
  //   reasons: devData.reasons,
  // });
  // store.commit('penalty/setVisible', true);
  store.commit('selector/setName', 'NuttyShrimp1');
  store.commit('selector/setType', 0);
  store.commit('selector/setVisible', true);
};
