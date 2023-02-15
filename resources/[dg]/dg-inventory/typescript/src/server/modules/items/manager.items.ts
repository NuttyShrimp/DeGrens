import { Util, Inventory } from '@dgx/server';
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
    if (!isNew && this.items.has(state.id!))
      throw new Error(`Tried to create item with already existing id ${state.id}`);

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
    if (!item) throw new Error(`Item ${id} does not exist`);
    const broke = item.checkDecay();
    if (broke) return;
    return item;
  };

  public remove = (id: string) => {
    this.items.delete(id);
  };

  @DGXEvent('inventory:server:moveItem')
  public move = async (src: number, id: string, position: Vec2, rotated: boolean, invId: string) => {
    const item = this.get(id);
    if (!item) {
      this.logger.warn(`Could not get item ${id}, broke while getting item to move`);
      return;
    }

    const prevInvId = item.state.inventory;
    if (src !== 0) {
      // we use zero when using this function internally
      const openIds = contextManager.getIdsByPlayer(src);
      if (!openIds) throw new Error(`Player tried to move item ${id} but does not have his inventory open`);
      if (prevInvId !== openIds[0] && prevInvId !== openIds[1])
        throw new Error(`Player tried to move item ${id} but does not have the original inventory id open`);
    }

    const playerName = src === 0 ? 'Server' : Util.getName(src);
    Util.Log(
      'inventory:item:moved',
      {
        byScript: src === 0,
        itemId: id,
        oldPosition: item.state.position,
        newPosition: position,
        oldInventory: prevInvId,
        newInventory: invId,
      },
      `${playerName} moved ${item.state.name} from ${prevInvId} to ${invId}`,
      src === 0 ? undefined : src
    );
    await item.move(src, position, rotated, invId);
  };

  @DGXEvent('inventory:server:useItem')
  private use = (src: number, id: string, hotkey = false) => {
    const item = this.get(id);
    if (!item) {
      this.logger.warn(`Could not get item ${id}, broke while getting item to use`);
      return;
    }
    item.use(src, hotkey);
  };

  @DGXEvent('inventory:server:useHotkey')
  private _useHotkey = async (src: number, key: Inventory.Hotkey) => {
    const invId = Inventory.concatId('player', Util.getCID(src));
    const inventory = await inventoryManager.get(invId);
    const items = inventory.getItems();
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

  public buildInitialMetadata = (plyId: number | undefined, itemName: string) => {
    const onCreateFunc = ON_CREATE[itemName];
    if (!onCreateFunc) return {};
    return onCreateFunc(plyId);
  };

  @Export('setMetadataOfItem')
  private _setMetadata = (id: string, cb: (old: { [key: string]: any }) => { [key: string]: any }) => {
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
}

const itemManager = ItemManager.getInstance();
export default itemManager;
