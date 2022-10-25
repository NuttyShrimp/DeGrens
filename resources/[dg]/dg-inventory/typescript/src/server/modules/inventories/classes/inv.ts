import { Events, Util } from '@dgx/server';
import { Item } from 'modules/items/classes/item';
import itemManager from 'modules/items/manager.items';
import locationManager from 'modules/locations/manager.locations';
import repository from 'services/repository';
import { mainLogger } from 'sv_logger';
import { doRectanglesOverlap } from './../helpers.inventories';
import winston from 'winston';
import inventoryManager from '../manager.inventories';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';
import { getConfig } from 'services/config';
import { splitId } from '../../../util';
import contextManager from 'classes/contextmanager';
import { getContainerInfo } from 'modules/containers/controller.containers';
import shopManager from 'modules/shops/classes/shopmanager';

// conflicted with Inventory types namespace so I went with the good old Inv
export class Inv {
  private logger: winston.Logger;
  private _id!: string;
  private _type!: Inventory.Type;
  private _identifier!: string;
  private _size!: number;
  private items!: Set<string>;
  private _allowedItems?: string[];

  constructor() {
    this.logger = mainLogger.child({ module: 'Inventory' });
  }

  public init = async (id: string) => {
    this._id = id;
    const { identifier, type } = splitId(id);
    this._type = type;
    this._identifier = identifier;
    this.items = new Set();

    const fixedSizes = getConfig()?.amountOfSlots;
    this.size = fixedSizes[this.type] ?? 0;

    if (this.type === 'shop') {
      this.allowedItems = [];
      const items = shopManager.getItems(this.id);
      for (const entry of items) {
        const item = await itemManager.create({
          name: entry.name,
          inventory: this.id,
          metadata: {},
        });
        if (!item) continue;
        item.setRequirements(entry.requirements);
      }
      // Shop size gets set set in getFirstAvailablePosition
    } else if (this.type === 'container') {
      const name = itemManager.get(this.identifier)?.state?.name;
      if (!name) return;
      const { allowedItems, size } = getContainerInfo(name);
      this.allowedItems = allowedItems;
      this.size = size;
    } else if (this.type === 'tunes') {
      this.allowedItems = (global.exports['dg-vehicles'].getAllowedTuneItems(this.identifier) as string[]) ?? [];
    }

    if (this.isPersistent()) {
      const states = await repository.fetchItems(this.id);
      for (const state of states) {
        await itemManager.create(state);
      }
    }

    this.logger.info(`Inventory ${this.id} loaded`);
  };

  // #region Getters/Setters
  public get id() {
    return this._id;
  }
  public get type() {
    return this._type;
  }
  public get identifier() {
    return this._identifier;
  }
  public get size() {
    return this._size;
  }
  public get allowedItems() {
    return this._allowedItems;
  }
  public set size(value: typeof this._size) {
    this._size = value;
  }
  private set allowedItems(value: typeof this._allowedItems) {
    this._allowedItems = value;
  }
  // #endregion

  public registerItemId = (itemState: Inventory.ItemState, checkSave = false) => {
    if (this.items.size == 0 && this.type === 'drop') locationManager.activateDrop(this.id);
    this.items.add(itemState.id);
    this.updatedInv('add', itemState);

    if (!checkSave) return;
    if (contextManager.getPlayersById(this.id).length === 0) {
      this.logger.info(`Saving ${this.id} because no one had it open`);
      this.save();
    }
  };

  public unregisterItemId = (itemState: Inventory.ItemState) => {
    this.items.delete(itemState.id);
    this.updatedInv('remove', itemState);
  };

  private updatedInv = async (action: 'add' | 'remove', itemState: Inventory.ItemState) => {
    emit('inventory:inventoryUpdated', this.type, this.identifier, action, itemState);

    if (this.type !== 'player') return;

    const newInv = await inventoryManager.get(itemState.inventory);
    if (newInv.type === 'drop' && newInv.items.size === 0) {
      const serverId = DGCore.Functions.GetPlayerByCitizenId(Number(this.identifier)).PlayerData.source;
      Events.emitNet('inventory:client:doDropAnimation', serverId);
    }

    const objectInfo = getConfig().itemObjects[itemState.name];
    if (objectInfo) {
      const serverId = DGCore.Functions.GetPlayerByCitizenId(Number(this.identifier)).PlayerData.source;
      Events.emitNet('inventory:client:updateObject', serverId, action, itemState.id, objectInfo);
    }
  };

  public getItems = () => {
    const ids = [...this.items];
    const items = ids.reduce<Item[]>((items, id) => {
      const item = itemManager.get(id);
      if (item) items.push(item);
      return items;
    }, []);
    return items.map(item => item.state);
  };

  public getItemsForName = (itemName: string) => {
    const items: Inventory.ItemState[] = [];
    this.items.forEach(id => {
      const item = itemManager.get(id);
      if (item?.state.name !== itemName) return;
      items.push(item.state);
    });
    return items;
  };

  public getFirstAvailablePosition = (itemName: string) => {
    if (this.items.size === 0) return { x: 0, y: 0 };
    const itemSize = itemDataManager.get(itemName).size;
    const cellsPerRow = getConfig().cellsPerRow;
    const mayOverlap = this.getItems().map(state => ({
      position: state.position,
      size: itemDataManager.get(state.name).size,
    }));
    const invSize = this.type !== 'shop' ? this.size : 1000;

    for (let y = 0; y < invSize - itemSize.y + 1; y++) {
      for (let x = 0; x < cellsPerRow - itemSize.x + 1; x++) {
        const position = { x, y };
        const anyOverlapping = mayOverlap.some(i => doRectanglesOverlap(position, itemSize, i.position, i.size));
        if (anyOverlapping) continue;
        if (this.type === 'shop') {
          if (position.y + itemSize.y > this.size) {
            this.size = position.y + itemSize.y;
          }
        }
        return position;
      }
    }
    return;
  };

  public save = () => {
    if (this.items.size == 0) {
      if (locationManager.isLocationBased(this.type))
        locationManager.removeLocation(this.type as Location.Type, this.id);
      return;
    }
    let itemStates = this.getItems();
    // If inv is not persistent we save the items under inventory id 'nonpersistent'. These get removed from db on resource start
    // By not deleting them from db immediatly we never need to recreate an item in db if item gets moved back to persistent inv
    if (!this.isPersistent()) {
      itemStates = itemStates.map(state => ({ ...state, inventory: 'nonpersistent' }));
    }
    repository.updateItems(itemStates);
    this.logger.info(`Inventory ${this.id} has been saved`);
  };

  private isPersistent = () => {
    const cfg = getConfig();
    if (cfg.persistentTypes.includes(this.type)) return true;
    if (cfg.vehicleTypes.includes(this.type)) {
      return global.exports['dg-vehicles'].isVinFromPlayerVeh(this.identifier);
    }
    return false;
  };

  public hasObject = () => {
    const items = this.getItems();
    const objectConfig = getConfig().itemObjects;
    return items.some(item => {
      const info = objectConfig[item.name];
      if (!info) return false;
      return info.type === 'primary';
    });
  };

  public destroyAllItems = () => {
    [...this.items].forEach(id => {
      const item = itemManager.get(id);
      if (item) {
        item.destroy();
      }
    });
  };
}
