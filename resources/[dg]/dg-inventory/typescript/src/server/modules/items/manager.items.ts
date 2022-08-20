import { Events, Util } from '@dgx/server';
import { DGXEvent, EventListener, Export, ExportRegister } from '@dgx/server/decorators';
import { mainLogger } from 'sv_logger';
import { concatId } from '../../util';
import winston from 'winston';
import contextManager from '../../classes/contextmanager';
import inventoryManager from '../inventories/manager.inventories';
import { Item } from './classes/item';
import { ON_CREATE } from './helpers.items';

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
    const id = state.id ?? Util.uuidv4();
    const item = new Item();
    this.items.set(id, item);
    await item.init({ state: { ...state, id }, isNew });
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
  public move = async (src: number, id: string, position: Vec2, invId: string) => {
    const item = this.get(id);
    if (!item) throw new Error(`Could not find item ${id} to move`);

    // Move requirements used in shops/crafting. Remove cash and items when moving item to ply
    const requirements = item.getRequirements();
    if (requirements) {
      if (requirements.cash) {
        const playerCash = global.exports['dg-financials'].getCash(src);
        if (playerCash < requirements.cash) {
          throw new Error(`Player tried to buy item for ${requirements.cash} but only had ${playerCash}`);
        }
        global.exports['dg-financials'].removeCash(src, requirements.cash, 'shop-item-bought');
      }
      if (requirements.items) {
        const plyInventory = await inventoryManager.get(invId);
        const plyItems = plyInventory.getItems();
        const idsToRemove: Set<string> = new Set();
        for (const reqItem of requirements.items) {
          const plyItem = plyItems.find(item => item.name === reqItem.name && !idsToRemove.has(item.id));
          if (!plyItem) throw new Error(`Player tried to buy item but was missing required item ${reqItem.name}`);
          idsToRemove.add(plyItem.id);
        }
        idsToRemove.forEach(id => itemManager.get(id)?.destroy());
      }
      item.clearRequirements();
      Util.Log(
        'inventory:buyShopItem',
        {
          shop: item.state.inventory,
          forCash: requirements.cash,
          forItems: requirements.items,
          itemId: item.state.id,
          player: invId,
        },
        `${GetPlayerName(String(src))} bought shopitem ${item.state.name} in shop ${item.state.inventory}`,
        src
      );
    }

    const prevInvId = item.state.inventory;
    if (src !== 0) {
      // we use zero when using this function internally
      const openIds = contextManager.getIdsByPlayer(src);
      if (!openIds) throw new Error(`Player tried to move item ${id} but does not have his inventory open`);
      if (prevInvId !== openIds[0] && prevInvId !== openIds[1])
        throw new Error(`Player tried to move item ${id} but does not have the original inventory id open`);
    }

    Util.Log(
      'inventory:movedItem',
      {
        itemId: id,
        oldPosition: item.state.position,
        newPosition: position,
        oldInventory: prevInvId,
        newInventory: invId,
      },
      `${GetPlayerName(String(src))} moved ${item.state.name} from ${prevInvId} to ${invId}`,
      src
    );
    await item.move(src, position, invId);
  };

  @DGXEvent('inventory:server:useItem')
  private use = (src: number, id: string, hotkey = false) => {
    const item = this.get(id);
    if (!item) throw new Error(`Could not find item ${id} to use`);
    item.use(src, hotkey);
  };

  @DGXEvent('inventory:server:useHotkey')
  private _useHotkey = async (src: number, key: Inventory.Hotkey) => {
    const plyInvId = concatId('player', Util.getCID(src));
    const plyItemStates = (await inventoryManager.get(plyInvId)).getItems();
    const itemId = plyItemStates.find(state => state.hotkey === key)?.id;
    if (!itemId) return;
    this.use(src, itemId, true);
  };

  @DGXEvent('inventory:server:bindItem')
  private _bind = (src: number, id: string, key: Inventory.Hotkey) => {
    const item = this.get(id);
    if (!item) throw new Error(`Could not find item ${id} to bind`);
    item.bind(src, key);
  };

  @DGXEvent('inventory:server:unbindItem')
  private _unbind = (src: number, id: string) => {
    const item = this.get(id);
    if (!item) throw new Error(`Could not find item ${id} to unbind`);
    item.unbind(src);
  };

  public buildInitialMetadata = (src: number, itemName: string) => {
    const onCreateFunc = ON_CREATE[itemName];
    if (!onCreateFunc) return {};
    return onCreateFunc(src);
  };

  @Export('setMetadataOfItem')
  private _setMetadata = (id: string, cb: (old: { [key: string]: any }) => { [key: string]: any }) => {
    const item = this.get(id);
    if (!item) return;
    item.setMetadata(cb);
  };

  @Export('setQualityOfItem')
  private _setQuality = (id: string, cb: (old: number) => number) => {
    const item = this.get(id);
    if (!item) return;
    item.setQuality(cb);
  };

  @Export('destroyItem')
  private _destroy = (id: string) => {
    const item = this.get(id);
    if (!item) return;
    item.destroy();
  };

  public unloadItem = (id: string) => {
    this.items.delete(id);
  };
}

const itemManager = ItemManager.getInstance();
export default itemManager;
