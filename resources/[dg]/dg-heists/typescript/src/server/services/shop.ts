import { Events, Financials, Inventory, Notifications, Phone, RPC, Reputations, UI, Util } from '@dgx/server';
import config from './config';
import { mainLogger } from 'sv_logger';

// cid to items
const activePickups: Record<number, string[]> = {};
const shopLogger = mainLogger.child({ module: 'Shop' });

Events.onNet('heists:shop:open', async (plyId: number) => {
  const menuData: ContextMenu.Entry[] = [
    {
      title: 'Laptop Shop',
      icon: 'laptop',
      disabled: true,
    },
  ];

  const playerItems = await Inventory.getPlayerItems(plyId);
  const shopItems = config.shop.items;

  for (let i = 0; i < shopItems.length; i++) {
    const shopItem = shopItems[i];
    if (shopItem.requiredItem && playerItems.findIndex(i => i.name === shopItem.requiredItem) === -1) continue;

    const label = Inventory.getItemData(shopItem.item)?.label ?? 'Unknown Item';

    menuData.push({
      title: label,
      callbackURL: 'heists/shop/buy',
      data: {
        itemIdx: i,
      },
    });
  }

  UI.openContextMenu(plyId, menuData);

  const logMsg = `${Util.getName(plyId)}(${plyId}) has opened shop`;
  shopLogger.silly(logMsg);
  Util.Log('heists:shop:open', {}, logMsg, plyId);
});

Events.onNet('heists:shop:buy', async (plyId, itemIdx: number) => {
  const shopConfig = config.shop;

  const cid = Util.getCID(plyId);
  const plyRep = Reputations.getReputation(cid, 'cornersell') ?? 0;
  if (plyRep < shopConfig.requiredReputation) {
    Notifications.add(plyId, 'Ik vertrouw je nog niet genoeg om zaken te doen', 'error');
    return;
  }

  const shopItem = shopConfig.items[itemIdx];
  if (!shopItem) return;

  const cryptoBalance = await Financials.cryptoGet(plyId, 'Manera');
  if (cryptoBalance < shopItem.price) {
    Notifications.add(plyId, 'Je kan dit momenteel niet betalen', 'error');
    const logMsg = `${Util.getName(plyId)}(${plyId}) tried to buy ${shopItem.item} but did not have enough crypto`;
    shopLogger.silly(logMsg);
    Util.Log(
      'heists:shop:notEnoughCrypto',
      {
        shopItem,
        cryptoBalance,
      },
      logMsg,
      plyId
    );
    return;
  }

  let requiredItemId: string | undefined;
  if (shopItem.requiredItem) {
    const requiredItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, shopItem.requiredItem);
    if (!requiredItem) {
      Notifications.add(plyId, 'Je mist iets', 'error');
      const logMsg = `${Util.getName(plyId)}(${plyId}) tried to buy ${shopItem.item} but did not have required item`;
      shopLogger.warn(logMsg);
      Util.Log(
        'heists:shop:lacksRequiredItem',
        {
          shopItem,
        },
        logMsg,
        plyId,
        true // dev important because this should get filtered when opening shop
      );
      return;
    }
    requiredItemId = requiredItem.id;
  }

  const cryptoRemoveSuccess = await Financials.cryptoRemove(plyId, 'Manera', shopItem.price);
  if (!cryptoRemoveSuccess) return;

  if (requiredItemId) {
    Inventory.destroyItem(requiredItemId);
  }

  const boughtItems = (activePickups[cid] ??= []);
  boughtItems.push(shopItem.item);

  Phone.sendMail(
    plyId,
    'Aankoop ophalen',
    'Leverancier',
    'Je kan je aankoop gaan ophalen bij mijn collega.<br>Hij bevindt zich nog altijd aan het afgelegen huis.'
  );

  const logMsg = `${Util.getName(plyId)}(${plyId}) bought ${shopItem.item}`;
  shopLogger.silly(logMsg);
  Util.Log(
    'heists:shop:buy',
    {
      shopItem,
    },
    logMsg,
    plyId
  );
});

Events.onNet('heists:shop:pickup', plyId => {
  const cid = Util.getCID(plyId);
  const items = activePickups[cid];
  if (!items || items.length === 0) {
    Notifications.add(plyId, 'Ik heb niks voor je', 'error');
    return;
  }

  items.forEach(item => {
    Inventory.addItemToPlayer(plyId, item, 1);
  });

  activePickups[cid] = [];

  const logMsg = `${Util.getName(plyId)}(${plyId}) has picked up his bought items`;
  shopLogger.silly(logMsg);
  Util.Log(
    'heists:shop:pickup',
    {
      items,
    },
    logMsg,
    plyId
  );
});

Inventory.registerUseable(['thermite_part', 'mini_emp_part'], async (plyId, item) => {
  const caseRemoved = await Inventory.removeItemByNameFromPlayer(plyId, 'explosive_case');
  if (!caseRemoved) {
    Notifications.add(plyId, 'Waar ga je dit insteken?', 'error');
    return;
  }

  const targetItem = item.name.substring(0, item.name.indexOf('_part'));
  Inventory.destroyItem(item.id);
  Inventory.addItemToPlayer(plyId, targetItem, 1);
});
