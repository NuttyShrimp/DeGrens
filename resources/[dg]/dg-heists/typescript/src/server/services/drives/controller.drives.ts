import { Chat, Events, RPC } from '@dgx/server';
import { DRIVE_DATA } from './constants.drives';

let activePickups: Record<number, Drives.Name> = {};

RPC.register('heists:server:getLaptopShopEntries', (source: number): ContextMenuEntry[] => {
  const Player = DGCore.Functions.GetPlayer(source);
  const menuData: ContextMenuEntry[] = [
    {
      title: 'Laptop Shop',
      icon: 'laptop',
    },
  ];
  Object.entries(DRIVE_DATA).forEach(([driveName, { text }]) => {
    if (!Player.Functions.GetItemByName(driveName)) return;
    menuData.push({
      title: text,
      callbackURL: 'heists:UI:closeLaptopShopMenu',
      data: { drive: driveName },
    });
  });
  return menuData;
});

// TODO: Crypto payment
RPC.register('heists:server:buyLaptop', async (source: number, drive: Drives.Name) => {
  const Player = DGCore.Functions.GetPlayer(source);
  const cryptoCost = DRIVE_DATA[drive].cost;
  const hasEnoughCrypto = (await global.exports['dg-financials'].cryptoGet(source, 'Manera')) >= cryptoCost;
  const hasItem = Player.Functions.GetItemByName(drive) ? true : false;
  if (!hasEnoughCrypto || !hasItem) return false;

  Player.Functions.RemoveItem(drive, 1);
  await global.exports['dg-financials'].cryptoRemove(source, 'Manera', cryptoCost);
  const citizenid = Player.PlayerData.citizenid;
  activePickups[citizenid] = drive;
  return true;
});

Events.onNet('heists:server:pickupLaptop', (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const citizenid = Player.PlayerData.citizenid;
  if (!activePickups[citizenid]) return;
  const laptop = DRIVE_DATA[activePickups[citizenid]].laptop;
  activePickups[citizenid] = null;
  Player.Functions.AddItem(laptop, 1);
  emitNet('inventory:client:ItemBox', src, laptop, 'add');
});

RPC.register('heists:server:hasActivePickup', (src: number): boolean => {
  const citizenid = DGCore.Functions.GetPlayer(src).PlayerData.citizenid;
  return activePickups[citizenid] ? true : false;
});
