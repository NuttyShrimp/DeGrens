import { Notifications, Reputations, Inventory, UI, Util } from '@dgx/server';
import { CAR_CLASSES } from 'sv_constants';
import { REPAIR_PARTS } from '@shared/status/constants.status';
import { TUNE_PARTS } from '@shared/upgrades/constants.upgrades';
import { buildMechanicStashId, buildPartLabel } from '@shared/mechanic/helpers.mechanic';
import { REQUIREMENTS_FOR_PART } from '../constants.mechanic';
import { getCurrentMechanicBusiness, getMechanicConfig } from '../service.mechanic';

export const finishOrder = async (plyId: number, order: Mechanic.PartItem[]) => {
  const shop = getCurrentMechanicBusiness(plyId);
  if (!shop) {
    Notifications.add(plyId, 'Je bent niet ingeclocked!', 'error');
    return;
  }

  const stashItems = await Inventory.getItemsInInventory('stash', `mechanic-shop-parts-${shop}`);

  // this is gonna be ticket item metadata with all data to calc
  const ticketItems: Mechanic.TicketMetadata['items'] = [];

  // Get items from mech stash
  const itemIds = new Set<string>();
  for (const orderItem of order) {
    let findCb: (i: Inventory.ItemState) => boolean;
    if (orderItem.type === 'repair') {
      findCb = i => i.name === REPAIR_PARTS[orderItem.part]?.itemName && i.metadata.class === orderItem.class;
    } else {
      findCb = i =>
        i.name === TUNE_PARTS[orderItem.part]?.itemName &&
        i.metadata.class === orderItem.class &&
        i.metadata.stage === orderItem.stage;
    }

    const item = stashItems.find(i => !itemIds.has(i.id) && findCb(i));
    if (!item) {
      break;
    } else {
      itemIds.add(item.id);
      ticketItems.push({
        itemId: item.id,
        amount: getRevenueForItem(orderItem),
        type: orderItem.type,
      });
    }
  }

  if (itemIds.size !== order.length) {
    Notifications.add(plyId, 'Niet alle order items waren op voorraad', 'error');
    return;
  }

  // Move the items to player when we sure all items are in stash
  const cid = Util.getCID(plyId);
  for (const itemId of itemIds) {
    await Inventory.moveItemToInventory('player', String(cid), itemId); // sadly need to await otherwise they would be in eachother
  }

  Inventory.addItemToPlayer(plyId, 'sales_ticket', 1, {
    hiddenKeys: ['items', 'origin'],
    origin: 'mechanic',
    items: ticketItems,
    info: order.map(buildPartLabel).join(', '),
  });
};

// Calculate price mechanic gets for order item
const getRevenueForItem = (item: Mechanic.PartItem) => {
  const rewardConfig = getMechanicConfig().reward;

  let partPrice = 0;

  // typescipt would be annoying otherwise
  if (item.type === 'repair') {
    partPrice = rewardConfig['repair'].parts[item.part] ?? 0;
  } else {
    partPrice = rewardConfig['tune'].parts[item.part] ?? 0;
    partPrice *= rewardConfig['tune'].stageModifier[item.stage] ?? 1;
  }

  const classModifier = rewardConfig.classModifier[item.class] ?? 1;
  const modifiedPrice = partPrice * classModifier;
  return +modifiedPrice.toFixed(2);
};

const getCountsInShopStash = async (shop: string) => {
  const stashItems = await Inventory.getItemsInInventory('stash', `mechanic-shop-parts-${shop}`);
  const itemCounts: Record<string, number> = {};
  for (const item of stashItems) {
    const carClass: CarClass = item.metadata.class;
    if (!carClass) continue;
    const stage = item.metadata.stage;
    const idxName = `${item.name}_${carClass}${stage ? `_${stage}` : ''}`;
    const amount = itemCounts[idxName] ?? 0;
    itemCounts[idxName] = amount + 1;
  }
  return itemCounts;
};

export const openPartsMenu = async (plyId: number) => {
  const shop = getCurrentMechanicBusiness(plyId);
  if (!shop) {
    Notifications.add(plyId, 'Je bent niet in een mechanic shop', 'error');
    return;
  }

  const cid = Util.getCID(plyId);
  const reputation = Reputations.getReputation(cid, 'mechanic_crafting') ?? 0;

  // first we get itemcounts in stash so we dont need to iterate for every menu entry
  const itemCounts = await getCountsInShopStash(shop);

  const menuEntries: ContextMenu.Entry[] = [
    {
      title: 'Onderdelen Maken',
      icon: 'toolbox',
      disabled: true,
    },
  ];

  const mechanicConfig = getMechanicConfig();
  let requiredReputation = 0;
  for (let i = 0; i < CAR_CLASSES.length; i++) {
    if (requiredReputation > reputation) break;
    const carClass = CAR_CLASSES[i];

    const { repairEntries, tuneEntries } = generatePartMenuEntries(itemCounts, carClass, 'mechanic/createPart');

    menuEntries.push({
      title: `Klasse: ${carClass}`,
      submenu: [
        {
          title: 'Repairs',
          description: `Benodigheden per part: ${i + 1}x aluminium, staal of ijzer`,
          submenu: repairEntries,
        },
        {
          title: 'Tunes',
          description: `Benodigheden per tune per stage: ${(i + 1) * 5}x aluminium, staal of ijzer`,
          submenu: tuneEntries,
        },
      ],
    });

    requiredReputation += mechanicConfig.reputationPerClass;
  }

  UI.openContextMenu(plyId, menuEntries);
};

export const craftPart = async (plyId: number, partItem: Mechanic.PartItem) => {
  const shop = getCurrentMechanicBusiness(plyId);
  if (!shop) {
    Notifications.add(plyId, 'Je bent niet in een mechanic shop', 'error');
    return;
  }

  const partData = partItem.type === 'repair' ? REPAIR_PARTS[partItem.part] : TUNE_PARTS[partItem.part];
  if (!partData) return;

  let amountNeeded = CAR_CLASSES.indexOf(partItem.class) + 1;
  if (partItem.type === 'tune') {
    amountNeeded *= partItem.stage;
  }
  if (amountNeeded === 0) return;

  const requirementsForPart = REQUIREMENTS_FOR_PART[partItem.type];
  amountNeeded *= requirementsForPart.amount;

  const mechanicStashId = buildMechanicStashId(shop);
  const items = await Inventory.getItemsInInventory('stash', mechanicStashId);
  const idsToRemove: string[] = [];
  for (const item of items) {
    if (idsToRemove.length === amountNeeded) break;
    if (!requirementsForPart.items.includes(item.name)) continue;
    idsToRemove.push(item.id);
  }

  if (idsToRemove.length !== amountNeeded) {
    Notifications.add(plyId, 'Er zijn niet genoeg materialen aanwezig in de opslag', 'error');
    return;
  }

  const removed = await Inventory.removeItemsByIdsFromInventory('stash', mechanicStashId, idsToRemove);
  if (!removed) {
    Notifications.add(plyId, 'Er is iets foutgelopen tijdens het maken', 'error');
    return;
  }

  const itemMetadata: Record<string, unknown> = {
    class: partItem.class,
  };
  if (partItem.type === 'tune') {
    itemMetadata.stage = partItem.stage;
  }

  Inventory.addItemToInventory('stash', `mechanic-shop-parts-${shop}`, partData.itemName, 1, itemMetadata);

  const cid = Util.getCID(plyId);
  Reputations.setReputation(cid, 'mechanic_crafting', old => old + 1);

  const partLabel = buildPartLabel(partItem);
  Notifications.add(plyId, `Je hebt een ${partLabel} gemaakt`);

  Util.Log(
    'vehicles:mechanic:craftPart',
    {
      shop,
      itemName: partData.itemName,
      partClass: partItem.class,
    },
    `${Util.getName(plyId)}(${plyId}) has crafted ${partLabel} for ${shop}`,
    plyId
  );
};

export const getOrderMenu = async (plyId: number) => {
  const shop = getCurrentMechanicBusiness(plyId);
  if (!shop) {
    Notifications.add(plyId, 'Je bent niet in een mechanic shop', 'error');
    return;
  }

  // first we get itemcounts in stash so we dont need to iterate for every menu entry
  const itemCounts = await getCountsInShopStash(shop);

  const menuEntries: ContextMenu.Entry[] = [];
  for (let i = 0; i < CAR_CLASSES.length; i++) {
    const carClass = CAR_CLASSES[i];

    const { repairEntries, tuneEntries } = generatePartMenuEntries(
      itemCounts,
      carClass,
      'mechanic/addPartToOrder',
      true
    );

    menuEntries.push({
      title: `Klasse: ${carClass}`,
      submenu: [
        {
          title: 'Repairs',
          submenu: repairEntries,
        },
        {
          title: 'Tunes',
          submenu: tuneEntries,
        },
      ],
    });
  }

  return menuEntries;
};

const generatePartMenuEntries = (
  itemCounts: Record<string, number>,
  carClass: CarClass,
  callbackURL: string,
  disableWhenZero = false
) => {
  const repairEntries: ContextMenu.Entry[] = Object.entries(REPAIR_PARTS).map(([part, { label, itemName }]) => {
    const stashAmount = itemCounts[`${itemName}_${carClass}`] ?? 0;
    const partItem: Mechanic.PartItem = {
      type: 'repair',
      class: carClass,
      part: part as Service.Part,
    };

    return {
      title: label,
      callbackURL,
      description: `Aantal in voorraad: ${stashAmount}`,
      data: {
        item: partItem,
      },
      preventCloseOnClick: true,
      disabled: disableWhenZero && stashAmount === 0,
    };
  });

  const tuneEntries: ContextMenu.Entry[] = Object.entries(TUNE_PARTS).reduce<ContextMenu.Entry[]>(
    (entries, [part, { amount, label, itemName }]) => {
      // amount - 1 because mech should be able to make highest stage cuz illegol
      const amountWithoutIllegal = amount - 1;
      if (amountWithoutIllegal <= 0) return entries;

      const submenu: ContextMenu.Entry[] = [...new Array(amountWithoutIllegal)].map((_, idx) => {
        const stage = idx + 1;
        const stashAmount = itemCounts[`${itemName}_${carClass}_${stage}`] ?? 0;
        const partItem: Mechanic.PartItem = {
          type: 'tune',
          class: carClass,
          part: part as Vehicles.Upgrades.Tune,
          stage,
        };

        return {
          title: `Stage: ${stage}`,
          callbackURL,
          description: `Aantal in voorraad: ${stashAmount}`,
          data: {
            item: partItem,
          },
          preventCloseOnClick: true,
          disabled: disableWhenZero && stashAmount === 0,
        };
      });
      entries.push({ title: label, submenu });
      return entries;
    },
    []
  );

  return { repairEntries, tuneEntries };
};
