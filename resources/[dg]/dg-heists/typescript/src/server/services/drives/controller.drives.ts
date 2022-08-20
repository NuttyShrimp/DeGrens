import { Config, Events, Inventory, RPC, Util } from '@dgx/server';

let activePickups: Record<number, Drives.Name> = {};

let driveConfig: Drives.Config;
setImmediate(async () => {
  await Config.awaitConfigLoad();
  driveConfig = Config.getConfigValue<Drives.Config>('heists.drives');
});

RPC.register('heists:server:getLaptopShopEntries', async (source: number): Promise<ContextMenuEntry[]> => {
  const menuData: ContextMenuEntry[] = [
    {
      title: 'Laptop Shop',
      icon: 'laptop',
    },
  ];
  for (const [driveName, { text }] of Object.entries(driveConfig)) {
    if (!(await Inventory.doesPlayerHaveItems(source, driveName))) return;
    menuData.push({
      title: text,
      callbackURL: 'heists:UI:closeLaptopShopMenu',
      data: { drive: driveName },
    });
  }
  return menuData;
});

RPC.register('heists:server:buyLaptop', async (source: number, drive: Drives.Name) => {
  const Player = DGCore.Functions.GetPlayer(source);
  const cryptoCost = driveConfig[drive]?.cost ?? 100;
  const hasEnoughCrypto = (await global.exports['dg-financials'].cryptoGet(source, 'Manera')) >= cryptoCost;
  const hasItem = await Inventory.doesPlayerHaveItems(source, drive);
  if (!hasEnoughCrypto || !hasItem) {
    Util.Log(
      'heists:laptop:buy',
      {
        drive,
        hasEnoughCrypto,
        hasDrive: hasItem,
      },
      `${Player.PlayerData.name} attempted to buy a ${drive} laptop`,
      source
    );
    return false;
  }

  Inventory.removeItemFromPlayer(source, 'drive');
  await global.exports['dg-financials'].cryptoRemove(source, 'Manera', cryptoCost);
  Util.Log(
    'heists:laptop:buy',
    {
      drive,
    },
    `${Player.PlayerData.name} bought a ${drive} laptop`,
    source
  );
  const citizenid = Player.PlayerData.citizenid;
  activePickups[citizenid] = drive;
  return true;
});

Events.onNet('heists:server:pickupLaptop', async (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const citizenid = Player.PlayerData.citizenid;
  if (!activePickups[citizenid]) return;
  const laptop = driveConfig[activePickups[citizenid]]?.laptop ?? 'laptop_v1';
  Util.Log(
    'heists:laptop:pickup',
    {
      laptop,
      origin: activePickups[citizenid],
    },
    `${GetPlayerName(src.toString())} picked up a ${laptop} laptop`,
    source
  );
  activePickups[citizenid] = null;
  Inventory.addItemToPlayer(src, laptop, 1);
});

RPC.register('heists:server:hasActivePickup', (src: number): boolean => {
  const citizenid = DGCore.Functions.GetPlayer(src).PlayerData.citizenid;
  return !!activePickups[citizenid];
});
