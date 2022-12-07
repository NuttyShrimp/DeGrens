import { Config, Events, Financials, Inventory, Notifications, RPC, UI, Util } from '@dgx/server';

const activePickups: Record<number, Shop.Name> = {};

let shopConfig: Shop.Config;
setImmediate(async () => {
  await Config.awaitConfigLoad();
  shopConfig = Config.getConfigValue<Shop.Config>('heists.shop');
});

const hasActivePickup = (plyId: number) => {
  const cid = Util.getCID(plyId);
  return !!activePickups[cid];
};

Events.onNet('heists:server:openIllegalShop', async (src: number) => {
  if (hasActivePickup(src)) {
    Notifications.add(src, 'Je hebt nog een actieve levering', 'error');
    return;
  }

  const menuData: ContextMenuEntry[] = [
    {
      title: 'Laptop Shop',
      icon: 'laptop',
    },
  ];

  for (const [itemName, { text }] of Object.entries(shopConfig)) {
    const hasItem = await Inventory.doesPlayerHaveItems(src, itemName);
    if (!hasItem && !['thermite_part', 'mini_emp_part'].includes(itemName)) continue;
    menuData.push({
      title: text,
      callbackURL: 'heists/buyIllegalShopItem',
      data: { drive: itemName },
    });
  }
  UI.openContextMenu(src, menuData);
});

RPC.register('heists:server:buyLaptop', async (source: number, drive: Shop.Name) => {
  const cid = Util.getCID(source);
  const cryptoCost = shopConfig[drive]?.cost ?? 100;
  const hasEnoughCrypto = (await Financials.cryptoGet(source, 'Manera')) >= cryptoCost;
  const hasItem = await Inventory.doesPlayerHaveItems(source, drive);
  const shouldRemoveItem = !['thermite_part', 'mini_emp_part'].includes(drive);
  if (!hasEnoughCrypto || (!hasItem && shouldRemoveItem)) {
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
  if (!success) return false;
  if (shouldRemoveItem) {
    Inventory.removeItemFromPlayer(source, drive);
  }

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
  const laptop = shopConfig[activePickups[cid]]?.laptop ?? 'laptop_v1';
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

RPC.register('heists:server:hasActivePickup', hasActivePickup);

Inventory.registerUseable(['thermite_part', 'mini_emp_part'], async (plyId, item) => {
  const caseRemoved = await Inventory.removeItemFromPlayer(plyId, 'explosive_case');
  if (!caseRemoved) {
    Notifications.add(plyId, 'Waar ga je dit insteken?', 'error');
    return;
  }

  const targetItem = item.name.substring(0, item.name.indexOf('_part'));
  Inventory.destroyItem(item.id);
  Inventory.addItemToPlayer(plyId, targetItem, 1);
});
