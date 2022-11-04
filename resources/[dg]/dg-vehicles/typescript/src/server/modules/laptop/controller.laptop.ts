import { Config, Events, RPC } from '@dgx/server';

import { doPurchase, getStoreItems, loadConfigInfo, receivePurchasedItems, restorePurchase } from './service.laptop';

setImmediate(async () => {
  await Config.awaitConfigLoad();
  loadConfigInfo();
});

onNet('dg-config:moduleLoaded', (name: string) => {
  if (name !== 'vehicles') return;
  loadConfigInfo();
});

Events.onNet('vehicles:server:laptop:receiveItems', src => {
  receivePurchasedItems(src);
});

RPC.register('vehicles:laptop:benny:doPurchase', (src, items: Record<string, number>) => {
  return doPurchase(src, items);
});

RPC.register('vehicles:laptop:benny:getItems', () => {
  return getStoreItems();
});

on('DGCore:server:playerLoaded', (playerData: PlayerData) => {
  restorePurchase(playerData.source, playerData.citizenid);
});
