import { Util, Inventory, Events } from '@dgx/server';
import { DGXEvent, EventListener, Export, ExportRegister } from '@dgx/server/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import contextManager from '../../classes/contextmanager';
import inventoryManager from '../inventories/manager.inventories';
import { Item } from './classes/item';
import { ON_CREATE } from './helpers.items';
import itemDataManager from 'classes/itemdatamanager';
import repository from 'services/repository';

@EventListener()
@ExportRegister()
class ItemManager extends Util.Singleton<ItemManager>() {
  private readonly logger: winston.Logger;
  private readonly items: Map<string, Item>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'ItemManager' });
    this.logger.info('Loaded');
    this.items = new Map();
  }

  public create = async (state: ItemBuildData) => {
    const isNew = state.id == undefined;
    if (!isNew && this.items.has(state.id!)) {
      const logMsg = `Tried to create item with already existing id ${state.id}`;
      this.logger.error(logMsg);
      Util.Log(
        'inventory:item:duplicateId',
        { itemId: state.id, newItem: state, existingItem: this.items.get(state.id!)!.state },
        logMsg,
        undefined,
        true
      );
    }

    // Check if name is a known item name, if not remove from db and return
    if (!itemDataManager.doesItemNameExist(state.name)) {
      if (isNew) {
        this.logger.error(`Tried to create a new item with nonexistent name ${state.name}`);
      } else {
        this.logger.error(`Inventory has an item with nonexistent name ${state.name}, deleting from database`);
        repository.deleteItem(state.id!);
      }
      return;
    }

    const id = state.id ?? Util.uuidv4();
    const item = new Item();
    this.items.set(id, item);
    await item.init({ state: { ...state, id }, isNew });
    if (item.checkDecay(true)) return;
    return item;
  };

  public get = (id: string) => {
    const item = this.items.get(id);
    if (!item) return;
    const broke = item.checkDecay();
    if (broke) return;
    return item;
  };

  public remove = (id: string) => {
    this.items.delete(id);
  };

  @DGXEvent('inventory:server:moveItem')
  public move = async (src: number, id: string, invId: string, position: Vec2, rotated: boolean) => {
    const byScript = src < 1;

    const item = this.get(id);
    if (!item) {
      this.logger.warn(`Could not get item ${id}, broke while getting item to move`);
      return;
    }

    const prevInvId = item.state.inventory;
    if (!byScript) {
      const openIds = contextManager.getIdsByPlayer(src);
      if (!openIds || (prevInvId !== openIds[0] && prevInvId !== openIds[1])) return; // can happen when moving and insta closing i guess
    }

    const inv = await inventoryManager.get(invId);
    const syncToEmitter = item.move(inv, position, rotated, byScript); // skip gridfree check when byscript because we got position/rotated from getfirstavailable
    this.syncItems(item.state, [prevInvId, invId], syncToEmitter ? undefined : src);

    const playerName = byScript ? 'Server' : Util.getName(src);
    Util.Log(
      'inventory:item:moved',
      {
        byScript,
        itemId: id,
        itemName: item.state.name,
        oldInventory: prevInvId,
        newInventory: invId,
      },
      `${playerName} moved ${item.state.name} from ${prevInvId} to ${invId}`,
      byScript ? undefined : src
    );
  };

  @DGXEvent('inventory:server:useItem')
  private _use = (src: number, id: string) => {
    const item = this.get(id);
    if (!item) {
      this.logger.warn(`Could not get item ${id}, broke while getting item to use`);
      return;
    }
    item.use(src);
  };

  @DGXEvent('inventory:server:useHotkey')
  private _useHotkey = async (src: number, key: Inventory.Hotkey) => {
    const invId = Inventory.concatId('player', Util.getCID(src));
    const inventory = await inventoryManager.get(invId);
    const items = inventory.getItems(true);
    const itemToUse = items.find(i => i.state.hotkey === key);
    if (!itemToUse) return;
    itemToUse.use(src, true);
  };

  @DGXEvent('inventory:server:bindItem')
  private _bind = (src: number, id: string, key: Inventory.Hotkey) => {
    const item = this.get(id);
    if (!item) {
      this.logger.warn(`Could not get item ${id}, broke while getting item to bind`);
      return;
    }
    item.bind(src, key);
  };

  @DGXEvent('inventory:server:unbindItem')
  private _unbind = (src: number, id: string) => {
    const item = this.get(id);
    if (!item) {
      this.logger.warn(`Could not get item ${id}, broke while getting item to unbind`);
      return;
    }
    item.unbind(src);
  };

  public buildInitialMetadata = (
    plyId: number | undefined,
    itemName: string,
    extraMetadata?: Record<string, any>
  ): Inventory.ItemState['metadata'] => {
    const initialMetadata = ON_CREATE?.[itemName]?.(plyId) ?? {};
    return {
      ...initialMetadata,
      ...(extraMetadata ?? {}),
      hiddenKeys: [...(initialMetadata.hiddenKeys ?? []), ...(extraMetadata?.hiddenKeys ?? [])],
    };
  };

  @Export('setMetadataOfItem')
  private _setMetadata = (
    id: string,
    cb: (old: Inventory.ItemState['metadata']) => Inventory.ItemState['metadata']
  ) => {
    const item = this.get(id);
    if (!item) {
      this.logger.warn(`Could not get item ${id}, broke while getting item to set metadata`);
      return;
    }
    item.setMetadata(cb);
  };

  @Export('setQualityOfItem')
  private _setQuality = (id: string, cb: (old: number) => number) => {
    const item = this.get(id);
    if (!item) {
      this.logger.warn(`Could not get item ${id}, broke while getting item to set quality`);
      return;
    }
    item.setQuality(cb);
  };

  @Export('destroyItem')
  private _destroy = (id: string) => {
    const item = this.get(id);
    if (!item) {
      this.logger.warn(`Could not get item ${id}, broke while getting item to set destroy`);
      return;
    }
    item.destroy();
  };

  public unloadItem = (id: string) => {
    this.items.delete(id);
  };

  public syncItems = (data: Inventory.ItemState | Inventory.ItemState[], inventories: string[], skipPly?: number) => {
    if (!Array.isArray(data)) {
      data = [data];
    }

    const playersWithAnyInventoryOpen = contextManager.getPlayersByIds(inventories);
    for (const ply of playersWithAnyInventoryOpen) {
      if (ply === skipPly) continue;
      Events.emitNet('inventory:client:syncItems', ply, data);
    }
  };

  @DGXEvent('inventory:server:moveMultipleItems')
  public moveMultipleItems = async (src: number, inventoryId: string, itemIds: string[]) => {
    let previousInventoryId: string | undefined;
    const items: Item[] = [];
    for (const itemId of itemIds) {
      const item = this.get(itemId);
      if (!item) {
        this.logger.warn(`Could not get item ${itemId}, broke while getting item to move`);
        continue;
      }

      if (!previousInventoryId) {
        previousInventoryId = item.state.inventory;
      } else if (item.state.inventory !== previousInventoryId) {
        // Can happen when quickly moving items and moved item is not synced to client yet while he emitted event to move it
        continue;
      }

      items.push(item);
    }

    if (!previousInventoryId) return;

    const byScript = src < 1;

    if (!byScript) {
      const openIds = contextManager.getIdsByPlayer(src);
      if (!openIds || (previousInventoryId !== openIds[0] && previousInventoryId !== openIds[1])) return; // can happen when moving and insta closing i guess
    }

    const inv = await inventoryManager.get(inventoryId);
    const itemStates: Inventory.ItemState[] = [];
    for (const item of items) {
      const itemSize = itemDataManager.get(item.state.name).size;
      const availableSpot = inv.getFirstAvailablePosition(itemSize, item.state.rotated);
      if (!byScript && !availableSpot) continue; // if this function was called by script we dont care if theres no space
      item.move(inv, availableSpot?.position ?? { x: 0, y: 0 }, availableSpot?.rotated ?? false, true);
      itemStates.push(item.state);
    }

    this.syncItems(itemStates, [previousInventoryId, inventoryId]);

    const playerName = byScript ? 'Server' : Util.getName(src);
    Util.Log(
      'inventory:item:movedMultiple',
      {
        byScript,
        itemId: itemIds,
        itemName: itemStates.map(s => s.name),
        oldInventory: previousInventoryId,
        newInventory: inventoryId,
      },
      `${playerName} moved multiple items from ${previousInventoryId} to ${inventoryId}`,
      byScript ? undefined : src
    );
  };
}

const itemManager = ItemManager.getInstance();
export default itemManager;
