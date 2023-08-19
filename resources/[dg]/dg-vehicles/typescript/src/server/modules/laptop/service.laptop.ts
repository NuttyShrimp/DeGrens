import { Config, Events, Financials, Inventory, Notifications, Util } from '@dgx/server';

let storeItems: Laptop.Bennys.Item[] = [];
let pickupZones: Laptop.Bennys.PickUp[] = [];

const pendingPickups: Record<
  number,
  {
    zone: number;
    items: Record<string, number>;
  }
> = {};

export const getStoreItems = () => storeItems;

export const loadConfigInfo = async () => {
  await Config.awaitConfigLoad();
  pickupZones = Config.getConfigValue<Laptop.Bennys.PickUp[]>('vehicles.laptop.pickup');
  const laptopItemsConfig =
    Config.getConfigValue<Record<string, Omit<Laptop.Bennys.Item, 'image' | 'category'>[]>>('vehicles.laptop.items');
  storeItems = [];
  await Inventory.awaitLoad();
  for (const itemCategory in laptopItemsConfig) {
    laptopItemsConfig[itemCategory].forEach(i => {
      const image = Inventory.getItemData(i.item)?.image ?? '';
      storeItems.push({
        ...i,
        image,
        category: itemCategory,
      });
    });
  }
};

export const doPurchase = async (src: number, items: Record<string, number>) => {
  const totalPrice = Object.entries(items).reduce<number>(
    (curTotal, [itemName, amount]) => curTotal + amount * (storeItems?.find(i => i.item === itemName)?.price ?? 0),
    0
  );
  const purchaseComplete = await Financials.cryptoRemove(src, 'Suliro', totalPrice);
  if (!purchaseComplete) {
    return false;
  }
  const cid = Util.getCID(src);
  if (!pendingPickups[cid]) {
    const location = Util.getRndInteger(0, pickupZones.length);
    pendingPickups[cid] = {
      zone: location,
      items: {},
    };
    Events.emitNet('vehicles:client:laptop:createPickupZone', src, pickupZones[location]);
  }
  for (const itemName in items) {
    if (!pendingPickups[cid].items[itemName]) {
      pendingPickups[cid].items[itemName] = 0;
    }
    pendingPickups[cid].items[itemName] += items[itemName];
  }
  Util.Log(`vehicles:bennysapp:bought`, { items }, `${Util.getName(src)}(${src}) has bought items from bennysapp`, src);
  return true;
};

export const receivePurchasedItems = (src: number) => {
  const cid = Util.getCID(src);
  if (!pendingPickups[cid]) {
    Notifications.add(src, 'Ik heb niks voor u...', 'error');
    return;
  }
  for (const item in pendingPickups[cid].items) {
    Inventory.addItemToPlayer(src, item, pendingPickups[cid].items[item]);
  }
  delete pendingPickups[cid];
};

// Check if had active purchase, ifso restore blip and polyzone
export const restorePurchase = (plyId: number, cid: number) => {
  if (!pendingPickups[cid]) return;
  Events.emitNet('vehicles:client:laptop:createPickupZone', plyId, pickupZones[pendingPickups[cid].zone]);
};
