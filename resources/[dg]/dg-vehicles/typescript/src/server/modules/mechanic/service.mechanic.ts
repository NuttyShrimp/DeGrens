import { Config, Events, Financials, Inventory, Notifications, Phone, Util } from '@dgx/server';
import vinManager from 'modules/identification/classes/vinmanager';

import { valueToLabel } from '../../../shared/constant.mechanic';

import { mechanicLogger } from './logger.mechanic';

// Object of all shops and there clocked in employees
const activeMechanics: Record<string, number[]> = {};
// Items that can be used to repair vehicles
const whitelistedItems = new Set<string>();
let config: Mechanic.Config;
const pendingJobs = new Map<string, { targets: number[]; origin: number; timeoutInfo: NodeJS.Timeout }>();
const assignedJobs = new Map<string, number>();

export const getAmountOfActiveMechanics = () => new Array<number>().concat(...Object.values(activeMechanics)).length;

// region Config
export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue('vehicles.mechanic');
  loadZones(-1);
};

export const loadZones = (src: number) => {
  Events.emitNet('vehicles:mechanic:client:loadConfig', src, config.shops, config.towVehicles);
};
// endregion

// region Clock-in
export const clockPlayerIn = (src: number, shop: string) => {
  const plyShop = getShopForPlayer(src);
  if (plyShop) {
    Notifications.add(src, `Je bent al ingeclocked ergens anders!`, 'error');
    return;
  }
  if (!activeMechanics[shop]) {
    activeMechanics[shop] = [];
  }
  activeMechanics[shop].push(src);
};

export const clockPlayerOut = (src: number) => {
  for (const shop in activeMechanics) {
    activeMechanics[shop].filter(serverId => serverId !== Number(src));
  }
};

const getShopForPlayer = (src: number) => {
  for (const shop in activeMechanics) {
    if (activeMechanics[shop].includes(src)) {
      return shop;
    }
  }
};
// endregion

// region Ticket System
const getNameForItem = (item: Mechanic.Tickets.Item) => {
  let itemName = '';
  if (item.type === 'repair') {
    itemName = `${item.part}_part_${item.class.toLowerCase()}`;
  } else {
    const lvl = item.type.replace(/upgrade_/, '');
    if (Number.isNaN(parseInt(lvl))) return;
    itemName = `tune_${item.part}_stage_${lvl}_${item.class.toUpperCase()}`;
  }
  return itemName;
};

export const getAmountOfItem = async (src: number, item: Mechanic.Tickets.Item): Promise<number> => {
  const plyShop = getShopForPlayer(src);
  if (!plyShop) return 0;
  const itemName = getNameForItem(item);
  if (!itemName) return 0;
  return Inventory.getAmountInInventory('stash', `mechanic-shop-parts-${plyShop}`, itemName ?? '');
};

export const giveOrder = async (src: number, order: Mechanic.Tickets.Item[]) => {
  const plyShop = getShopForPlayer(src);
  if (!plyShop) {
    Notifications.add(src, 'Je bent niet ingeclocked!', 'error');
    return;
  }
  const items = order.map(item => {
    // axle_part_d
    // tune_suspension_stage_4_A+
    const itemName = getNameForItem(item);
    return {
      id: '',
      name: itemName,
      ...item,
    };
  });
  if (items.some(item => item === undefined)) {
    Notifications.add(src, `Er is iets fout gelopen bij het creeren van de order`, 'error');
    mechanicLogger.error(`Failed to convert order to the right items`, {
      order,
      itemNames: items,
    });
    return;
  }
  for (const item of items) {
    // TS doing TS things. This is already checked above
    if (!item) continue;
    const stashAmount = await Inventory.getAmountInInventory(
      'stash',
      `mechanic-shop-parts-${plyShop}`,
      item?.name ?? ''
    );
    if (stashAmount < (item?.amount ?? 0)) {
      Notifications.add(
        src,
        `Er zijn te weinig ${item.class} ${valueToLabel[item.type]} ${valueToLabel[item.part]}`,
        'error'
      );
      return;
    }
  }
  // Actually move the items
  const cid = Util.getCID(src);
  for (const itemInfo of items) {
    if (!itemInfo || !itemInfo.name) continue;
    const item = await Inventory.getFirstItemOfName('stash', `mechanic-shop-parts-${plyShop}`, itemInfo?.name);
    if (!item) {
      mechanicLogger.error(`Failed to find item ${itemInfo.name} in mechanic-shop-parts-${plyShop}`);
      return;
    }
    await Inventory.moveItemToInventory('player', String(cid), item.id);
    whitelistedItems.add(item.id);
    itemInfo.id = item.id;
  }
  Inventory.addItemToPlayer(src, 'sales_ticket', 1, {
    items,
  });
};

export const getRevenueForItem = (item: Mechanic.Tickets.ExtItem) => {
  const partPrice = config.reward.parts[item.part] ?? 0;
  const classModifier = config.reward.class[item.class] ?? 1;
  const typeModifier = config.reward.type[item.type] ?? 1;
  return partPrice * classModifier * typeModifier;
};

export const tradeSalesTickets = async (src: number) => {
  const cid = Util.getCID(src);
  const ticketAmount = await Inventory.getAmountInInventory('player', String(cid), 'sales_ticket');
  if (!ticketAmount) {
    Notifications.add(src, 'Je hebt geen Sales Tickets opzak', 'error');
    return;
  }
  const tickets = await Inventory.getItemsForNameInInventory('player', String(cid), 'sales_ticket');
  let revenue = 0;
  for (const ticket of tickets) {
    const data = ticket.metadata as Mechanic.Tickets.ItemMetadata;
    const ticketRevenues = await Promise.all(
      data.items.map(async i => {
        const itemState = Inventory.getItemStateById(i.id);
        if (itemState && itemState.name === i.name) {
          return 0;
        }
        return getRevenueForItem(i);
      })
    );
    revenue += ticketRevenues.reduce((tot, rev) => {
      return tot + rev;
    }, 0);
  }
  const plyDefAcc = Financials.getDefaultAccountId(cid);
  if (!plyDefAcc) return;
  const success = await Financials.paycheck(plyDefAcc, cid, revenue);
  if (!success) {
    Notifications.add(src, `Systeem is gefaald om €${revenue} uit te betalen`, 'error');
    return;
  }
  Notifications.add(src, `Je hebt €${revenue} verdiend aan je tickets`);
  for (const ticket of tickets) {
    Inventory.removeItemByIdFromPlayer(cid, ticket.id);
  }
};
// endregion

// region Tow job
export const sendTowJob = (src: number, vin: string) => {
  const notification: Phone.Notification = {
    title: 'Sleep aanvraag',
    description: 'Accepteer om aan te nemen',
    icon: {
      name: 'truck-tow',
      background: 'black',
      color: 'white',
    },
    id: `tow-request-${vin}`,
    _data: {
      vin,
    },
    onAccept: 'vehicles:mechanic:acceptTowJob',
  };
  const targets = Object.values(activeMechanics).reduce((targets, srvIds) => targets.concat(srvIds), []);
  pendingJobs.set(vin, {
    targets: targets,
    origin: src,
    timeoutInfo: setTimeout(() => {
      Notifications.add(src, 'Er was geen reactie op je takel aanvraag...');
    }, 30000),
  });
  targets.forEach(srvId => {
    Phone.showNotification(srvId, notification);
  });
};

export const overwriteTowJob = (src: number, vin: string) => {
  const job = pendingJobs.get(vin);
  if (!job) {
    sendTowJob(src, vin);
    return;
  }
  clearTimeout(job.timeoutInfo);
  pendingJobs.set(vin, {
    targets: job.targets,
    origin: src,
    timeoutInfo: setTimeout(() => {
      Notifications.add(src, 'Er was geen reactie op je takel aanvraag...');
    }, 30000),
  });
};

export const isPlayerAssigned = (src: number, vin: string) => {
  const assignedPly = assignedJobs.get(vin);
  if (!assignedPly) return false;
  return assignedPly === src;
};

export const finishJob = (vin: string) => {
  const assignedPly = assignedJobs.get(vin);
  if (!assignedPly) return false;
  assignedJobs.delete(vin);
};

export const tryAcceptingJob = (src: number, vin: string) => {
  const jobInfo = pendingJobs.get(vin);
  if (!jobInfo) {
    Notifications.add(src, 'Iemand was je voor!', 'error');
    return;
  }
  jobInfo.targets.forEach(srvId => {
    emitNet('dg-phone:client:notification:remove', srvId, `tow-request-${vin}`);
  });
  Notifications.add(jobInfo.origin, 'Er is takeldiens onderweg voor je aanvraag!');
  assignedJobs.set(vin, src);
  const vehNetId = vinManager.getNetId(vin);
  if (!vehNetId) return;
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  const vehCoords = Util.ArrayToVector3(GetEntityCoords(veh));
  Events.emitNet('vehicles:mechanic:assignJob', src, vin, vehCoords);
};
// endregion

export const moveCraftedItemToShopParts = (plyId: number, item: Inventory.ItemState) => {
  // If player is not in a mechanic shop but somehow crafted item in mech bench then destroy item
  const plyShop = getShopForPlayer(plyId);
  if (!plyShop) {
    mechanicLogger.warn(
      `${Util.getName(plyId)}(${plyId}) crafted an item in mechanic bench whilst not being in a mechanicshop`
    );
    Inventory.destroyItem(item.id);
    return;
  }
  Inventory.moveItemToInventory('stash', `mechanic-shop-parts-${plyShop}`, item.id);
};
