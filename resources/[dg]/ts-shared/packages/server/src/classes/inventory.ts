import { Events, Util } from './index';
import { Util as UtilShared } from '@dgx/shared';

class Inventory extends UtilShared.Singleton<Inventory>() {
  private isLoaded: boolean;
  private readonly usageHandlers: Map<string, Inventory.UsageHandler<any>[]>;
  private readonly updateHandlers: Map<Inventory.Type, Inventory.UpdateHandlerData[]>;

  constructor() {
    super();
    this.isLoaded =
      GetResourceState('dg-inventory') === 'started' && (global.exports['dg-inventory']?.isLoaded?.() ?? false);
    this.usageHandlers = new Map();
    this.updateHandlers = new Map();
    on('inventory:usedItem', (src: number, state: Inventory.ItemState) => {
      if (!this.usageHandlers.has(state.name)) return;
      this.usageHandlers.get(state.name)!.forEach(handler => handler(src, state));
    });
    on('inventory:loaded', () => {
      this.isLoaded = true;
    });
  }

  private getPlyIdentifier = (plyId: number) => String(Util.getCID(plyId));

  public concatId = (type: Inventory.Type, identifier: string | number): string => {
    return `${type}__${identifier}`;
  };

  public splitId = (inventoryId: string): { type: Inventory.Type; identifier: string } => {
    const splitted = inventoryId.split('__', 2);
    return {
      type: splitted[0] as Inventory.Type,
      identifier: splitted[1],
    };
  };

  public registerUseable = <T extends Record<string, unknown> = {}>(
    items: string | string[],
    handler: Inventory.UsageHandler<T>
  ): void => {
    if (Array.isArray(items)) {
      items.forEach(item => this.addUsageHandler(item, handler));
      return;
    }
    this.addUsageHandler(items, handler);
  };

  private addUsageHandler = <T extends Record<string, unknown> = {}>(
    item: string,
    handler: Inventory.UsageHandler<T>
  ) => {
    const allHandlers = this.usageHandlers.get(item) ?? [];
    allHandlers.push(handler);
    this.usageHandlers.set(item, allHandlers);
  };

  public getAllItemData = (): Record<string, Inventory.ItemData> => {
    return global.exports['dg-inventory'].getAllItemData();
  };

  /**
   * Make sure to await load when using this in resource start function
   */
  public getItemData = (itemName: string): Inventory.ItemData => {
    return global.exports['dg-inventory'].getItemData(itemName);
  };

  public hasObject = (plyId: number): Promise<boolean> => {
    return global.exports['dg-inventory'].hasObject(plyId);
  };

  public giveStarterItems = (plyId: number) => {
    global.exports['dg-inventory'].giveStarterItems(plyId);
  };

  public clearInventory = (type: Inventory.Type, identifier: string) => {
    global.exports['dg-inventory'].clearInventory(type, identifier);
  };
  public clearPlayerInventory = (plyId: number) => {
    this.clearInventory('player', this.getPlyIdentifier(plyId));
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
    return this.addItemToInventory('player', this.getPlyIdentifier(plyId), name, amount, metadata);
  };

  public doesInventoryHaveItems = (
    type: Inventory.Type,
    identifier: string,
    items: string | string[]
  ): Promise<boolean> => {
    return global.exports['dg-inventory'].doesInventoryHaveItems(type, identifier, items);
  };
  public doesPlayerHaveItems = (plyId: number, items: string | string[]): Promise<boolean> => {
    return this.doesInventoryHaveItems('player', this.getPlyIdentifier(plyId), items);
  };

  public removeItemsByNamesFromInventory = (
    type: Inventory.Type,
    identifier: string,
    names: string[]
  ): Promise<boolean> => {
    return global.exports['dg-inventory'].removeItemsByNamesFromInventory(type, identifier, names);
  };
  public removeItemsByNamesFromPlayer = (plyId: number, names: string[]): Promise<boolean> => {
    return global.exports['dg-inventory'].removeItemsByNamesFromInventory(
      'player',
      this.getPlyIdentifier(plyId),
      names
    );
  };

  public removeItemByNameFromInventory = (
    type: Inventory.Type,
    identifier: string,
    name: string,
    amount?: number
  ): Promise<boolean> => {
    const names = new Array(amount ?? 1).fill(name);
    return this.removeItemsByNamesFromInventory(type, identifier, names);
  };
  public removeItemByNameFromPlayer = (plyId: number, name: string, amount?: number): Promise<boolean> => {
    return this.removeItemByNameFromInventory('player', this.getPlyIdentifier(plyId), name, amount);
  };

  public removeItemsByIdsFromInventory = (
    type: Inventory.Type,
    identifier: string,
    ids: string[]
  ): Promise<boolean> => {
    return global.exports['dg-inventory'].removeItemsByIdsFromInventory(type, identifier, ids);
  };
  public removeItemsByIdsFromPlayer = (plyId: number, ids: string[]): Promise<boolean> => {
    return this.removeItemsByIdsFromInventory('player', this.getPlyIdentifier(plyId), ids);
  };

  public removeItemByIdFromInventory = (type: Inventory.Type, identifier: string, id: string): Promise<boolean> => {
    return this.removeItemsByIdsFromInventory(type, identifier, [id]);
  };
  public removeItemByIdFromPlayer = (plyId: number, id: string): Promise<boolean> => {
    return this.removeItemsByIdsFromInventory('player', this.getPlyIdentifier(plyId), [id]);
  };

  public getAmountInInventory = (type: Inventory.Type, identifier: string, name: string): Promise<number> => {
    return global.exports['dg-inventory'].getAmountInInventory(type, identifier, name);
  };
  public getAmountPlayerHas = (plyId: number, name: string): Promise<number> => {
    return this.getAmountInInventory('player', this.getPlyIdentifier(plyId), name);
  };

  public getItemStateById = <T extends Record<string, unknown> = {}>(
    id: string
  ): Inventory.ItemState<T> | undefined => {
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
  public moveItemToPlayer = async (plyId: number, itemId: string) => {
    await this.moveItemToInventory('player', this.getPlyIdentifier(plyId), itemId);
  };

  public getItemsInInventory = <T extends Record<string, unknown> = {}>(
    type: Inventory.Type,
    identifier: string
  ): Promise<Inventory.ItemState<T>[]> => {
    return global.exports['dg-inventory'].getItemsInInventory(type, identifier);
  };

  public getPlayerItems = <T extends Record<string, unknown> = {}>(plyId: number) => {
    const cid = String(Util.getCID(plyId));
    return this.getItemsInInventory<T>('player', cid);
  };

  public getItemsWithNameInInventory = <T extends Record<string, unknown> = {}>(
    type: Inventory.Type,
    identifier: string,
    name: string
  ): Promise<Inventory.ItemState<T>[]> => {
    return global.exports['dg-inventory'].getItemsWithNameInInventory(type, identifier, name);
  };

  public getFirstItemOfName = <T extends Record<string, unknown> = {}>(
    type: Inventory.Type,
    identifier: string,
    name: string
  ): Promise<Inventory.ItemState<T> | undefined> => {
    return global.exports['dg-inventory'].getFirstItemOfName(type, identifier, name);
  };
  public getFirstItemOfNameOfPlayer = <T extends Record<string, unknown> = {}>(
    plyId: number,
    name: string
  ): Promise<Inventory.ItemState<T> | undefined> => {
    return this.getFirstItemOfName('player', this.getPlyIdentifier(plyId), name);
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
    if (allHandlerData.length === 1) {
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
  };

  public awaitLoad = async () => {
    await Util.awaitCondition(() => this.isLoaded, false);
  };

  public createScriptedStash = (identifier: string, size: number, allowedItems?: string[]) => {
    this.awaitLoad().then(() => {
      global.exports['dg-inventory'].createScriptedStash(identifier, size, allowedItems);
    });
  };

  public moveAllItemsToInventory = (
    originType: Inventory.Type,
    originIdentifier: string,
    targetType: Inventory.Type,
    targetIdentifier: string
  ) => {
    global.exports['dg-inventory'].moveAllItemsToInventory(originType, originIdentifier, targetType, targetIdentifier);
  };

  /**
   * Only use this function if you are not sure the item you want to get is in a loaded inventory.
   * Example: you save itemids to later check if they still exist. Use this function for that because those items might be in unloaded inventories
   */
  public getItemStateFromDatabase = <T extends Record<string, unknown> = {}>(
    itemId: string
  ): Promise<Inventory.ItemState<T> | null> => {
    return global.exports['dg-inventory'].getItemStateFromDatabase(itemId);
  };

  public toggleObject = (plyId: number, itemId: string, toggle: boolean) => {
    global.exports['dg-inventory'].toggleObject(plyId, itemId, toggle);
  };

  public toggleAllObjects = (plyId: number, toggle: boolean) => {
    global.exports['dg-inventory'].toggleAllObjects(plyId, toggle);
  };

  public doesInventoryHaveItemWithId = (type: Inventory.Type, identifier: string, itemId: string): Promise<boolean> => {
    return global.exports['dg-inventory'].doesInventoryHaveItemWithId(type, identifier, itemId);
  };
  public doesPlayerHaveItemWithId = (plyId: number, itemId: string): Promise<boolean> => {
    const cid = String(Util.getCID(plyId));
    return this.doesInventoryHaveItemWithId('player', cid, itemId);
  };

  public showItemBox = (plyId: number, itemName: string, label: string, isLink = false) => {
    global.exports['dg-inventory'].showItemBox(plyId, itemName, label, isLink);
  };

  public openStash = (plyId: number, stashId: string, size?: number): void => {
    Events.emitNet('inventory:client:open', plyId, { type: 'stash', identifier: stashId, data: size });
  };

  public openOtherPlayer = (plyId: number, otherPlayer: number): void => {
    Events.emitNet('inventory:client:open', plyId, { type: 'player', data: otherPlayer });
  };

  public forceUnloadInventory = (inventoryId: string) => {
    global.exports['dg-inventory'].forceUnloadInventory(inventoryId);
  };
}

export default {
  Inventory: Inventory.getInstance(),
};
