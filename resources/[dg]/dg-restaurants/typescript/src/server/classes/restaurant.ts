import { Business, Financials, Inventory, Notifications, Phone, TaxIds, UI, Util } from '@dgx/server';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

export class Restaurant {
  private readonly logger: winston.Logger;
  private readonly _id: string;
  private readonly label: string;

  private readonly menuItems: Record<string, Omit<Restaurants.MenuItem, 'price'>>;
  private readonly orders: Restaurants.Order[];

  constructor(id: string) {
    const restaurantConfig = config.restaurants[id];

    this._id = id;
    this.label = restaurantConfig.label;
    this.menuItems = {};
    this.orders = [];

    restaurantConfig.registerZones.forEach((_, idx) => {
      const invId = this.buildRegisterInventoryId(idx);
      Inventory.createScriptedStash(invId, 7, []);
    });

    this.logger = mainLogger.child({ module: this.label });
    this.logger.info('Loaded');

    // Load items
    for (const [item, data] of Object.entries(config.restaurants[this.id].items)) {
      this.menuItems[item] = {
        item,
        label: Inventory.getItemData(item).label,
        requiredItems: data.requiredItems,
        isLeftover: data.isLeftover ?? false,
      };
    }
  }

  public get id() {
    return this._id;
  }

  private buildRegisterInventoryId = (registerId: number) => `register_${this.id}_${registerId}`;

  private logAction = (plyId: number, logType: string, logMessage: string, data: Record<string, any> = {}) => {
    const fullLogMessage = `${Util.getName(plyId)}(${plyId}) ${logMessage}`;
    this.logger.silly(fullLogMessage);
    Util.Log(
      `restaurants:${logType}`,
      {
        restaurantId: this.id,
        ...data,
      },
      `${fullLogMessage} at restaurant ${this.id}`,
      plyId
    );
  };

  private validateBusinessEmployee = (plyId: number, perm?: string) => {
    if (!Business.isPlayerSignedIn(plyId, this.id)) return false;
    if (perm) {
      const cid = Util.getCID(plyId);
      return Business.hasPlyPermission(this.id, cid, perm);
    }
    return true;
  };

  public getMenuItems = () => {
    const menuItemsWithPrices: Record<string, Restaurants.MenuItem> = {};
    for (const [item, data] of Object.entries(this.menuItems)) {
      menuItemsWithPrices[item] = {
        ...data,
        price: this.getMenuItemPrice(item),
      };
    }
    return menuItemsWithPrices;
  };

  private getMenuItemPrice = (item: string) => {
    return Business.getItemPrice(this.id, item) ?? 0;
  };

  private getOrderByRegisterId = (registerId: number) => {
    return this.orders.find(o => o.registerId === registerId);
  };

  public doesRegisterHaveOrder = (registerId: number) => {
    return this.getOrderByRegisterId(registerId) !== undefined;
  };

  private calculateOrderPrice = (order: Restaurants.Order) => {
    return order.items.reduce((acc, cur) => {
      return acc + this.getMenuItemPrice(cur.item);
    }, 0);
  };

  public checkRegisterBill = (plyId: number, registerId: number) => {
    const order = this.getOrderByRegisterId(registerId);
    if (!order || order.paid) {
      Notifications.add(plyId, 'Er hoeft momenteel niks betaald te worden', 'error');
      return;
    }

    const totalPrice = this.calculateOrderPrice(order);
    const taxedPrice = Financials.getTaxedPrice(totalPrice, TaxIds.Goederen).taxPrice;

    const orderItemEntries: ContextMenu.Entry[] = [];
    for (const item of order.items) {
      const menuItem = this.menuItems[item.item];
      if (!menuItem) continue;
      const itemPrice = this.getMenuItemPrice(item.item);
      const taxedPrice = Financials.getTaxedPrice(itemPrice, TaxIds.Goederen).taxPrice;
      orderItemEntries.push({
        disabled: true,
        title: `${menuItem.label} | €${taxedPrice}`,
      });
    }

    const menuEntries: ContextMenu.Entry[] = [
      {
        title: `Bestelling | Kassa #${registerId + 1}`,
        disabled: true,
      },
      ...orderItemEntries,
      {
        title: 'Betaal',
        description: `Totaalprijs: €${taxedPrice}`,
        callbackURL: 'restaurant/payBill',
        data: {
          restaurantId: this.id,
          registerId,
        },
      },
    ];

    UI.openContextMenu(plyId, menuEntries);
  };

  public payRegisterBill = async (plyId: number, registerId: number) => {
    const order = this.getOrderByRegisterId(registerId);
    if (!order || order.paid) {
      Notifications.add(plyId, 'Er hoeft momenteel niks betaald te worden', 'error');
      return;
    }

    const totalPrice = this.calculateOrderPrice(order);

    const cid = Util.getCID(plyId);
    const accId = Financials.getDefaultAccountId(cid);
    if (!accId) {
      Notifications.add(plyId, 'Je hebt geen bankaccount', 'error');
      return;
    }

    const business = Business.getBusinessByName(this.id);
    if (!business) {
      Notifications.add(plyId, 'Er is iets misgelopen', 'error');
      const logMsg = `restaurant ${this.id} has no associated business`;
      Util.Log(`restaurants:noBusiness`, { restaurantId: this.id }, logMsg, undefined, true);
      this.logger.error(logMsg);
      return;
    }

    const success = await Financials.transfer(
      accId,
      business.info.bank_account_id,
      cid,
      cid,
      totalPrice,
      `${this.label} betaling`,
      TaxIds.Goederen
    );
    const notifMessage = success ? 'Successvol betaald' : 'Je hebt niet genoeg op je rekening';
    Phone.showNotification(plyId, {
      id: `${this.id}-payment-${Date.now()}`,
      title: notifMessage,
      description: '',
      icon: 'info',
    });

    if (!success) return;
    order.paid = true;
    order.paidBy = accId;

    this.logAction(plyId, 'paidBill', `has paid register ${registerId} bill`, {
      registerId,
      items: order.items,
    });
  };

  public setOrder = (plyId: number, registerId: number, items: string[]) => {
    const isEmployee = this.validateBusinessEmployee(plyId);
    if (!isEmployee) return;

    if (this.doesRegisterHaveOrder(registerId)) return;
    this.orders.push({
      items: items.map(i => ({ item: i, made: false, quality: 0 })),
      registerId: registerId,
      paid: false,
    });

    this.logAction(plyId, 'newOrder', `has set order of register ${registerId}`, {
      registerId,
      items,
    });
  };

  private removeRegisterOrder = (registerId: number) => {
    const orderIdx = this.orders.findIndex(o => o.registerId === registerId);
    if (orderIdx === -1) return;
    this.orders.splice(orderIdx, 1);
  };

  /**
   * Cancel order at register, pay back if already paid
   */
  public cancelRegisterOrder = (plyId: number, registerId: number) => {
    const isEmployee = this.validateBusinessEmployee(plyId);
    if (!isEmployee) return;

    const order = this.getOrderByRegisterId(registerId);
    if (!order) return;

    let paidBack = false;

    // if already paid, pay back
    if (order.paid && order.paidBy) {
      const business = Business.getBusinessByName(this.id);
      if (!business) {
        const logMsg = `restaurant ${this.id} has no associated business`;
        Util.Log(`restaurants:noBusiness`, { restaurantId: this.id }, logMsg, undefined, true);
        this.logger.error(logMsg);
        return;
      }

      const ownerCid = business.employees.find(e => e.isOwner)?.citizenid;
      if (!ownerCid) {
        const logMsg = `business ${this.id} has no owner`;
        Util.Log(`restaurants:noOwner`, { restaurantId: this.id }, logMsg, undefined, true);
        this.logger.error(logMsg);
        return;
      }

      const price = this.calculateOrderPrice(order);

      Financials.transfer(
        business.info.bank_account_id,
        order.paidBy,
        ownerCid,
        ownerCid,
        price,
        `${this.label} terugbetaling (order afgebroken)`
      );
      paidBack = true;
    }

    this.removeRegisterOrder(registerId);

    this.logAction(plyId, 'canceledOrder', `has canceled order of register ${registerId}`, {
      registerId,
      paidBack,
    });
  };

  public finishRegisterOrder = async (plyId: number, registerId: number) => {
    const isEmployee = this.validateBusinessEmployee(plyId);
    if (!isEmployee) return;

    const order = this.getOrderByRegisterId(registerId);
    if (!order) return;

    if (!order.paid) {
      Notifications.add(plyId, 'Order is nog niet betaald', 'error');
      return;
    }

    if (order.items.some(i => !i.made)) {
      Notifications.add(plyId, 'Order is nog volledig gemaakt', 'error');
      return;
    }

    for (const orderItem of order.items) {
      if (!orderItem.made) return;
      Inventory.addItemToInventory('stash', this.buildRegisterInventoryId(registerId), orderItem.item, 1, {
        hiddenKeys: ['quality'],
        quality: orderItem.quality,
      });
    }

    const totalPrice = this.calculateOrderPrice(order);
    // person who made order gets ticketPrice, other signed in employee get percentage of it
    const ticketPrice = Math.min(totalPrice, config.maxPerTicket);
    const sharedPrice = Math.round(ticketPrice * config.sharedPercentage);

    this.removeRegisterOrder(registerId);

    this.logAction(plyId, 'finishedOrder', `has finished order of register ${registerId}`, {
      registerId,
    });

    const signedInPlayers = Business.getSignedInPlayers(this.id);
    signedInPlayers.forEach(employee => {
      Inventory.addItemToPlayer(employee, 'sales_ticket', 1, {
        origin: 'generic',
        amount: employee === plyId ? ticketPrice : sharedPrice,
        hiddenKeys: ['origin', 'amount'],
      });
    });
  };

  public showActiveOrder = (plyId: number, registerId: number) => {
    const isEmployee = this.validateBusinessEmployee(plyId);
    if (!isEmployee) return false;

    const order = this.getOrderByRegisterId(registerId);
    if (!order) return false;

    const orderItemEntries: ContextMenu.Entry[] = order.items.map(i => {
      return {
        title: this.menuItems[i.item]?.label ?? 'Unknown',
        description: i.made ? 'Al klaargemaakt' : 'Nog niet klaargemaakt',
        icon: i.made ? 'check' : 'timer',
      };
    });

    const menuEntries: ContextMenu.Entry[] = [
      {
        title: `Kassa #${registerId + 1}`,
        description: 'Actief Order',
        icon: 'burger-glass',
        disabled: true,
      },
      {
        title: `Betalingsstatus`,
        description: order.paid ? 'Betaald!' : 'Nog niet betaald!',
        icon: 'receipt',
        disabled: true,
      },
      ...orderItemEntries,
      {
        title: `Annuleer Order`,
        icon: 'burger-glass',
        submenu: [
          {
            title: 'Confirm',
            callbackURL: 'restaurant/cancelOrder',
            data: {
              restaurantId: this.id,
              registerId: registerId,
            },
          },
        ],
      },
    ];

    if (order.items.every(i => i.made) && order.paid) {
      menuEntries.push({
        title: 'Leg op aanrecht',
        icon: 'hand-holding',
        callbackURL: 'restaurant/finishOrder',
        data: {
          restaurantId: this.id,
          registerId: registerId,
        },
      });
    }

    UI.openContextMenu(plyId, menuEntries);

    return true;
  };

  public doCooking = async (plyId: number, fromItem: string) => {
    const isEmployee = this.validateBusinessEmployee(plyId);
    if (!isEmployee) return;

    const toItem = config.restaurants[this.id].cooking.find(c => c.from === fromItem)?.to;
    if (!toItem) return;

    const removed = await Inventory.removeItemByNameFromPlayer(plyId, fromItem);
    if (!removed) return;

    Inventory.addItemToPlayer(plyId, toItem, 1);

    this.logAction(plyId, 'cook', `has cooked ${fromItem} to ${toItem}`, { fromItem, toItem });
  };

  public showCreateItemMenu = async (plyId: number, item: string) => {
    const isEmployee = this.validateBusinessEmployee(plyId);
    if (!isEmployee) return;

    const requiredItems = this.menuItems[item]?.requiredItems;
    if (!requiredItems) return;

    const hasItems = await Inventory.doesPlayerHaveItems(plyId, requiredItems);
    if (!hasItems) {
      Notifications.add(plyId, 'Je hebt de nodige ingrediënten niet', 'error');
      return;
    }

    const keygameAmount = Math.min(8, (requiredItems.length + 1) * 2);
    const registerMenuEntries: ContextMenu.Entry[] = [];

    for (const order of this.orders) {
      // check if any item is same as creating item and not made yet
      if (order.items.every(i => i.item !== item || i.made)) continue;
      registerMenuEntries.push({
        title: `Kassa #${order.registerId + 1}`,
        callbackURL: 'restaurant/createItem',
        data: {
          registerId: order.registerId,
          restaurantId: this.id,
          item,
          keygameAmount,
        },
      });
    }

    if (registerMenuEntries.length === 0) {
      Notifications.add(plyId, 'Dit is niet vereist voor een actief order', 'error');
      return;
    }

    const menuEntries: ContextMenu.Entry[] = [
      {
        title: 'Kies Order',
        description: 'Voor welke kassa is dit gerecht?',
        icon: 'cash-register',
        disabled: true,
      },
      ...registerMenuEntries,
    ];

    UI.openContextMenu(plyId, menuEntries);
  };

  public createItem = async (plyId: number, registerId: number, item: string) => {
    const isEmployee = this.validateBusinessEmployee(plyId);
    if (!isEmployee) return;

    const requiredItems = this.menuItems[item]?.requiredItems;
    if (!requiredItems) return;

    let orderIdx: number | null = null;
    let orderItemIdx: number | null = null;
    for (const key in this.orders) {
      const idx = Number(key);
      const order = this.orders[idx];
      if (this.orders[idx].registerId !== registerId) continue;

      const itemIdx = order.items.findIndex(i => !i.made && i.item === item);
      if (itemIdx === -1) continue;

      orderIdx = idx;
      orderItemIdx = itemIdx;
      break;
    }

    if (orderItemIdx === null || orderIdx === null) {
      Notifications.add(plyId, 'Dit is niet vereist voor een actief order', 'error');
      return;
    }

    // quality gotten from metadata of farm items (lettuce, tomato, etc)
    const qualities: number[] = [];
    const itemsLeftToRemove = [...requiredItems];

    if (itemsLeftToRemove.length !== 0) {
      const idsToRemove: string[] = [];
      const allPlayerItems = await Inventory.getPlayerItems<{ quality: number }>(plyId);
      for (const itemState of allPlayerItems) {
        // try early exit if already found all items
        if (itemsLeftToRemove.length === 0) break;

        const idx = itemsLeftToRemove.indexOf(itemState.name);
        if (idx === -1) continue;

        idsToRemove.push(itemState.id);
        itemsLeftToRemove.splice(idx, 1);
        qualities.push(itemState.metadata.quality ?? 100);
      }

      const removed = await Inventory.removeItemsByIdsFromPlayer(plyId, idsToRemove);
      if (!removed) {
        Notifications.add(plyId, 'Je hebt de nodige ingrediënten niet', 'error');
        return;
      }
    }

    const averageQuality = qualities.length === 0 ? 100 : qualities.reduce((acc, n) => acc + n, 0) / qualities.length;

    this.orders[orderIdx].items[orderItemIdx] = {
      item,
      made: true,
      quality: averageQuality,
    };

    Notifications.add(plyId, 'Item aan het order toegevoegd', 'success');

    this.logAction(plyId, 'createItem', `has created ${item} for register ${registerId}`, {
      item,
      registerId,
      quality: averageQuality,
    });

    // send notif to everyone if whole order is complete
    if (this.orders[orderIdx].items.every(i => i.made)) {
      Business.getSignedInPlayers(this.id).forEach(ply => {
        Notifications.add(ply, `Order aan kassa #${registerId + 1} is volledig!`, 'success');
      });
    }
  };

  public showLeftover = (plyId: number) => {
    const menuEntries: ContextMenu.Entry[] = [
      {
        title: `${this.label} Leftovers`,
        description: 'Hier kan je beschikbare leftovers kopen',
        icon: 'burger-soda',
        disabled: true,
      },
    ];

    if (!Business.isAnyPlayerSignedIn(this.id)) {
      for (const [item, data] of Object.entries(this.menuItems)) {
        if (!data.isLeftover) continue;

        const taxedPrice = Financials.getTaxedPrice(this.getMenuItemPrice(item), TaxIds.Goederen).taxPrice;
        menuEntries.push({
          title: `${data.label} | €${taxedPrice}`,
          callbackURL: 'restaurant/buyLeftover',
          preventCloseOnClick: true,
          data: {
            restaurantId: this.id,
            item,
          },
        });
      }
    } else {
      menuEntries.push({
        title: 'Momenteel geen beschikbaar',
        description: 'Kom later eens terug',
        icon: 'ban',
      });
    }

    UI.openContextMenu(plyId, menuEntries);
  };

  public buyLeftover = async (plyId: number, item: string) => {
    const menuItem = this.menuItems[item];
    if (!menuItem || !menuItem.isLeftover) return;

    const cid = Util.getCID(plyId);
    const accId = Financials.getDefaultAccountId(cid);
    if (!accId) {
      Notifications.add(plyId, 'Je hebt geen bankaccount', 'error');
      return;
    }

    const business = Business.getBusinessByName(this.id);
    if (!business) {
      Notifications.add(plyId, 'Er is iets misgelopen', 'error');
      const logMsg = `restaurant ${this.id} has no associated business`;
      Util.Log(`restaurants:noBusiness`, { restaurantId: this.id }, logMsg, undefined, true);
      this.logger.error(logMsg);
      return;
    }

    const success = await Financials.transfer(
      accId,
      business.info.bank_account_id,
      cid,
      cid,
      this.getMenuItemPrice(item),
      `${this.label} betaling (leftover)`,
      TaxIds.Goederen
    );

    if (!success) {
      Notifications.add(plyId, 'Er is iets misgelopen bij de betaling', 'error');
      return;
    }

    Inventory.addItemToPlayer(plyId, item, 1, { quality: 50, hiddenKeys: ['quality'] });
  };
}
