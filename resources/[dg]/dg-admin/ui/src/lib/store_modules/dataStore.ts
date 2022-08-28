import { Module } from 'vuex';

import { BankAccount, Item, PlayerData, RoutingBucket, Vehicle, WeatherType, WhitelistedJob } from '../../types/common';
import { DataStore, State } from '../../types/state';
import { nuiAction } from '../nui/action';

export const dataStore: Module<DataStore, State> = {
  namespaced: true,
  state: {
    vehicleModels: [],
    routingBuckets: [],
    bankAccounts: [],
    whitelistedJobs: [],
    items: [],
    weatherTypes: [],
    playerData: {
      bucketId: 0,
    },
  },
  mutations: {
    setVehicleModels(state, models: Vehicle[]) {
      models.sort((m1, m2) => m1.model.localeCompare(m2.model));
      state.vehicleModels = models;
    },
    setRoutingBuckets(state, buckets: RoutingBucket[]) {
      buckets.sort((b1, b2) => b1.id - b2.id);
      state.routingBuckets = [...buckets];
    },
    setBankAccounts(state, accounts: BankAccount[]) {
      state.bankAccounts = accounts;
    },
    setwhitelistedJobs(state, jobs: WhitelistedJob[]) {
      state.whitelistedJobs = jobs;
    },
    setPlayerData(state, data: PlayerData) {
      state.playerData = data;
    },
    setItems(state, items: Item[]) {
      state.items = items;
    },
    setWeatherTypes(state, weatherTypes: WeatherType[]) {
      state.weatherTypes = weatherTypes;
    },
  },
  actions: {
    async loadPlayerData({ commit }) {
      const data = await nuiAction('getPlayerData');
      commit('setPlayerData', data);
    },
    async loadData({ commit }) {
      const models = await nuiAction('getVehicleModels');
      commit('setVehicleModels', models);
      const buckets = await nuiAction('getRoutingBuckets');
      commit('setRoutingBuckets', buckets);
      const accounts = await nuiAction('getBankAccounts');
      commit('setBankAccounts', accounts);
      const jobs = await nuiAction('getWhitelistedJobs');
      commit('setwhitelistedJobs', jobs);
      const items = await nuiAction('getItems');
      commit('setItems', items);
      const weatherTypes = await nuiAction('getWeatherTypes');
      commit('setWeatherTypes', weatherTypes);
    },
  },
};
