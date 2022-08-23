import { Util } from './index';

class Inventory {
  private usageHandlers: Map<string, Inventory.UsageHandler[]>;

  constructor() {
    this.usageHandlers = new Map();
    on('inventory:usedItem', (src: number, state: Inventory.ItemState) => {
      if (!this.usageHandlers.has(state.name)) return;
      this.usageHandlers.get(state.name)!.forEach(handler => handler(src, state));
    });
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
    return global.exports['dg-inventory'].doesPlayerHaveObject(plyId);
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

  public addItemToPlayer = (plyId: number, name: string, amount: number, metadata?: { [key: string]: any }) => {
    global.exports['dg-inventory'].addItemToPlayer(plyId, name, amount, metadata);
  };

  public doesPlayerHaveItems = (plyId: number, name: string | string[]): Promise<boolean> => {
    return global.exports['dg-inventory'].doesPlayerHaveItems(plyId, name);
  };

  public removeItemFromPlayer = (plyId: number, name: string): Promise<boolean> => {
    return global.exports['dg-inventory'].removeItemFromPlayer(plyId, name);
  };

  public getAmountPlayerHas = (plyId: number, name: string): Promise<number> => {
    return global.exports['dg-inventory'].getAmountPlayerHas(plyId, name);
  };

  public getItemById = (id: string): Inventory.ItemData | undefined => {
    return global.exports['dg-inventory'].getItemById(id);
  };

  public setMetadataOfItem = (id: string, cb: (old: { [key: string]: any }) => { [key: string]: any }) => {
    global.exports['dg-inventory'].setMetadataOfItem(id, cb);
  };

  public setQualityOfItem = (id: string, cb: (old: number) => number) => {
    global.exports['dg-inventory'].setQualityOfItem(id, cb);
  };

  public moveItemToInventory = (itemId: string, type: Inventory.Type, identifier: string) => {
    global.exports['dg-inventory'].moveItemToInventory(itemId, type, identifier);
  };

  public getItemsInInventory = (type: Inventory.Type, identifier: string): Promise<Inventory.ItemState[]> => {
    return global.exports['dg-inventory'].getItemsInInventory(type, identifier);
  };

  public getFirstIdOfName = (
    type: Inventory.Type,
    identifier: string,
    name: string
  ): Promise<Inventory.ItemState | undefined> => {
    return global.exports['dg-inventory'].getFirstIdOfName(type, identifier, name);
  };

  public destroyItem = (id: string) => {
    global.exports['dg-inventory'].destroyItem(id);
  };
}

export default {
  Inventory: new Inventory(),
};
