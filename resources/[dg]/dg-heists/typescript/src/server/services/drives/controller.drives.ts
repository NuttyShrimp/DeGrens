import { Config, Events, Financials, Inventory, RPC, Util } from '@dgx/server';

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
  const cid = Util.getCID(source);
  const cryptoCost = driveConfig[drive]?.cost ?? 100;
  const hasEnoughCrypto = (await Financials.cryptoGet(source, 'Manera')) >= cryptoCost;
  const hasItem = await Inventory.doesPlayerHaveItems(source, drive);
  if (!hasEnoughCrypto || !hasItem) {
    Util.Log(
      'heists:laptop:buy',
      {
        drive,
        hasEnoughCrypto,
        hasDrive: hasItem,
      },
      `${Util.getName(source)} attempted to buy a ${drive} laptop`,
      source
    );
    return false;
  }

  const success = await Financials.cryptoRemove(source, 'Manera', cryptoCost);
  if (!success) return;
  Inventory.removeItemFromPlayer(source, 'drive');

  Util.Log(
    'heists:laptop:buy',
    {
      drive,
    },
    `${Util.getName(source)} bought a ${drive} laptop`,
    source
  );
  activePickups[cid] = drive;
  return true;
});

Events.onNet('heists:server:pickupLaptop', async (src: number) => {
  const cid = Util.getCID(src);
  if (!activePickups[cid]) return;
  const laptop = driveConfig[activePickups[cid]]?.laptop ?? 'laptop_v1';
  Util.Log(
    'heists:laptop:pickup',
    {
      laptop,
      origin: activePickups[cid],
    },
    `${Util.getName(src)} picked up a ${laptop} laptop`,
    source
  );
  activePickups[cid] = null;
  Inventory.addItemToPlayer(src, laptop, 1);
});

RPC.register('heists:server:hasActivePickup', (src: number): boolean => {
  const cid = Util.getCID(src);
  return !!activePickups[cid];
});
