import { Util } from './index';

class Inventory {
  private usageHandlers: Map<string, Inventory.UsageHandler[]>;
  private updateHandlers: Map<Inventory.Type, Inventory.UpdateHandlerData[]>;

  constructor() {
    this.usageHandlers = new Map();
    this.updateHandlers = new Map();
    on('inventory:usedItem', (src: number, state: Inventory.ItemState) => {
      if (!this.usageHandlers.has(state.name)) return;
      this.usageHandlers.get(state.name)!.forEach(handler => handler(src, state));
    });
    on(
      'inventory:inventoryUpdated',
      (type: Inventory.Type, identifier: string, action: 'add' | 'remove', itemState: Inventory.ItemState) => {
        const handlerData = this.updateHandlers.get(type);
        if (!handlerData) return;
        handlerData.forEach(data => {
          if (data.item && data.item !== itemState.name) return;
          if (data.action && data.action !== action) return;
          data.handler(identifier, action, itemState);
        });
      }
    );
  }

  public registerUseable = (items: string | string[], handler: Inventory.UsageHandler): void => {
    if (Array.isArray(items)) {
      items.forEach(item => this.addUsageHandler(item, handler));
      return;
    }
    this.addUsageHandler(items, handler);
  };

  private addUsageHandler = (item: string, handler: Inventory.UsageHandler) => {
    const allHandlers = this.usageHandlers.get(item) ?? [];
    allHandlers.push(handler);
    this.usageHandlers.set(item, allHandlers);
  };

  public getAllItemData = (): Promise<Record<string, Inventory.ItemData>> => {
    return global.exports['dg-inventory'].getAllItemData();
  };

  public getItemData = (itemName: string): Inventory.ItemData | undefined => {
    return global.exports['dg-inventory'].getItemData(itemName);
  };

  public hasObject = (plyId: number): boolean => {
    return global.exports['dg-inventory'].hasObject(plyId);
  };

  public giveStarterItems = (plyId: number) => {
    global.exports['dg-inventory'].giveStarterItems(plyId);
  };

  public clearInventory = (type: Inventory.Type, identifier: string) => {
    global.exports['dg-inventory'].clearInventory(type, identifier);
  };
  public clearPlayerInventory = (plyId: number) => {
    const cid = String(Util.getCID(plyId));
    this.clearInventory('player', cid);
  };

  public addItemToInventory = (
    type: Inventory.Type,
    identifier: string,
    name: string,
    amount: number,
    metadata?: { [key: string]: any }
  ): Promise<string[]> => {
    return global.exports['dg-inventory'].addItemToInventory(type, identifier, name, amount, metadata);
  };
  public addItemToPlayer = (
    plyId: number,
    name: string,
    amount: number,
    metadata?: { [key: string]: any }
  ): Promise<string[]> => {
    const cid = String(Util.getCID(plyId));
    return this.addItemToInventory('player', cid, name, amount, metadata);
  };

  public doesInventoryHaveItems = (
    type: Inventory.Type,
    identifier: string,
    items: string | string[]
  ): Promise<boolean> => {
    return global.exports['dg-inventory'].doesInventoryHaveItems(type, identifier, items);
  };
  public doesPlayerHaveItems = (plyId: number, items: string | string[]): Promise<boolean> => {
    const cid = String(Util.getCID(plyId));
    return this.doesInventoryHaveItems('player', cid, items);
  };

  public removeItemFromInventory = (type: Inventory.Type, identifier: string, name: string): Promise<boolean> => {
    return global.exports['dg-inventory'].removeItemFromInventory(type, identifier, name);
  };
  public removeItemFromPlayer = (plyId: number, name: string): Promise<boolean> => {
    const cid = String(Util.getCID(plyId));
    return this.removeItemFromInventory('player', cid, name);
  };

  removeItemByIdFromInventory = (type: Inventory.Type, identifier: string, id: string): Promise<boolean> => {
    return global.exports['dg-inventory'].removeItemByIdFromInventory(type, identifier, id);
  };
  removeItemByIdFromPlayer = (plyId: number, id: string): Promise<boolean> => {
    const cid = String(Util.getCID(plyId));
    return this.removeItemByIdFromInventory('player', cid, id);
  };

  public getAmountInInventory = (type: Inventory.Type, identifier: string, name: string): Promise<number> => {
    return global.exports['dg-inventory'].getAmountInInventory(type, identifier, name);
  };
  public getAmountPlayerHas = (plyId: number, name: string): Promise<number> => {
    const cid = String(Util.getCID(plyId));
    return this.getAmountInInventory('player', cid, name);
  };

  public getItemStateById = (id: string): Inventory.ItemState | undefined => {
    return global.exports['dg-inventory'].getItemStateById(id);
  };

  public setMetadataOfItem = (id: string, cb: (old: { [key: string]: any }) => { [key: string]: any }) => {
    global.exports['dg-inventory'].setMetadataOfItem(id, cb);
  };

  public setQualityOfItem = (id: string, cb: (old: number) => number) => {
    global.exports['dg-inventory'].setQualityOfItem(id, cb);
  };

  public moveItemToInventory = async (type: Inventory.Type, identifier: string, itemId: string) => {
    await global.exports['dg-inventory'].moveItemToInventory(type, identifier, itemId);
  };

  public getItemsInInventory = (type: Inventory.Type, identifier: string): Promise<Inventory.ItemState[]> => {
    return global.exports['dg-inventory'].getItemsInInventory(type, identifier);
  };

  public getItemsForNameInInventory = (
    type: Inventory.Type,
    identifier: string,
    name: string
  ): Promise<Inventory.ItemState[]> => {
    return global.exports['dg-inventory'].getItemsForNameInInventory(type, identifier, name);
  };

  public getFirstItemOfName = (
    type: Inventory.Type,
    identifier: string,
    name: string
  ): Promise<Inventory.ItemState | undefined> => {
    return global.exports['dg-inventory'].getFirstItemOfName(type, identifier, name);
  };
  public getFirstItemOfNameOfPlayer = (plyId: number, name: string): Promise<Inventory.ItemState | undefined> => {
    const cid = String(Util.getCID(plyId));
    return this.getFirstItemOfName('player', cid, name);
  };

  public destroyItem = (id: string) => {
    global.exports['dg-inventory'].destroyItem(id);
  };

  public onInventoryUpdate = (
    type: Inventory.Type,
    handler: Inventory.UpdateHandlerData['handler'],
    item?: string,
    action?: 'add' | 'remove'
  ) => {
    const allHandlerData = this.updateHandlers.get(type) ?? [];
    allHandlerData.push({ handler, item, action });
    this.updateHandlers.set(type, allHandlerData);
  };

  public isItemDataLoaded = () => {
    return global.exports['dg-inventory'].isItemDataLoaded();
  };

  public createScriptedStash = (identifier: string, size: number, allowedItems?: string[]) => {
    global.exports['dg-inventory'].createScriptedStash(identifier, size, allowedItems);
  };

  public concatId = (type: Inventory.Type, identifier: string | number): string => {
    return global.exports['dg-inventory'].concatId(type, identifier);
  };

  public splitId = (inventoryId: string): { type: Inventory.Type; identifier: string } => {
    return global.exports['dg-inventory'].splitId(inventoryId);
  };

  public showItemBox = (plyId: number, label: string, itemName: string) => {
    global.exports['dg-inventory'].showItemBox(plyId, label, itemName);
  };

  public removeItemAmountFromInventory = async (
    type: Inventory.Type,
    identifier: string,
    name: string,
    amount: number
  ): Promise<boolean> => {
    const items = await this.getItemsForNameInInventory(type, identifier, name);
    if (items.length < amount) return false;
    const itemsToRemove = items.slice(0, amount);
    itemsToRemove.forEach(item => {
      this.destroyItem(item.id);
    });
    return true;
  };

  public removeItemAmountFromPlayer = async (plyId: number, name: string, amount: number): Promise<boolean> => {
    const cid = String(Util.getCID(plyId));
    const success = await this.removeItemAmountFromInventory('player', cid, name, amount);
    if (success) {
      this.showItemBox(plyId, `${amount}x verwijderd`, name);
    }
    return success;
  };
}

export default {
  Inventory: new Inventory(),
};
