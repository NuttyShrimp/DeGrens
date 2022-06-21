import { Config, Events, RPC } from '@dgx/server';

let activePickups: Record<number, Drives.Name> = {};

let driveConfig: Drives.Config;
setImmediate(async () => {
  await Config.awaitConfigLoad();
  driveConfig = Config.getConfigValue<Drives.Config>('heists.drives')
})

RPC.register('heists:server:getLaptopShopEntries', async (source: number): Promise<ContextMenuEntry[]> => {
  const Player = DGCore.Functions.GetPlayer(source);
  const menuData: ContextMenuEntry[] = [
    {
      title: 'Laptop Shop',
      icon: 'laptop',
    },
  ];
  Object.entries(driveConfig ?? []).forEach(([driveName, { text }]) => {
    if (!Player.Functions.GetItemByName(driveName)) return;
    menuData.push({
      title: text,
      callbackURL: 'heists:UI:closeLaptopShopMenu',
      data: { drive: driveName },
    });
  });
  return menuData;
});

RPC.register('heists:server:buyLaptop', async (source: number, drive: Drives.Name) => {
  const Player = DGCore.Functions.GetPlayer(source);
  const cryptoCost = driveConfig[drive]?.cost ?? 100;
  const hasEnoughCrypto = (await global.exports['dg-financials'].cryptoGet(source, 'Manera')) >= cryptoCost;
  const hasItem = Player.Functions.GetItemByName(drive) ? true : false;
  if (!hasEnoughCrypto || !hasItem) return false;

  Player.Functions.RemoveItem(drive, 1);
  await global.exports['dg-financials'].cryptoRemove(source, 'Manera', cryptoCost);
  const citizenid = Player.PlayerData.citizenid;
  activePickups[citizenid] = drive;
  return true;
});

Events.onNet('heists:server:pickupLaptop', async (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const citizenid = Player.PlayerData.citizenid;
  if (!activePickups[citizenid]) return;
  const laptop = driveConfig[activePickups[citizenid]]?.laptop ?? 'laptop_v1';
  activePickups[citizenid] = null;
  Player.Functions.AddItem(laptop, 1);
  emitNet('inventory:client:ItemBox', src, laptop, 'add');
});

RPC.register('heists:server:hasActivePickup', (src: number): boolean => {
  const citizenid = DGCore.Functions.GetPlayer(src).PlayerData.citizenid;
  return activePickups[citizenid] ? true : false;
});
