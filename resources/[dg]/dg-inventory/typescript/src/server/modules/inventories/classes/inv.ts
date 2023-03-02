import { Events, Inventory, Util } from '@dgx/server';
import itemManager from 'modules/items/manager.items';
import locationManager from 'modules/locations/manager.locations';
import repository from 'services/repository';
import { mainLogger } from 'sv_logger';
import { doRectanglesOverlap } from './../helpers.inventories';
import winston from 'winston';
import inventoryManager from '../manager.inventories';
import itemDataManager from 'classes/itemdatamanager';
import { getConfig } from 'services/config';
import contextManager from 'classes/contextmanager';
import { getContainerInfo } from 'modules/containers/controller.containers';
import objectsUtility from 'classes/objectsutility';
import { Item } from 'modules/items/classes/item';

// conflicted with Inventory types namespace so I went with the good old Inv
export class Inv {
  private logger: winston.Logger;
  private _id!: string;
  private _type!: Inventory.Type;
  private _identifier!: string;
  private _size!: number;
  private items!: Set<string>;
  private _allowedItems?: string[];

  private _isLoaded: boolean;

  constructor() {
    this.logger = mainLogger.child({ module: 'Inventory' });
    this._isLoaded = false;
  }

  public init = async (id: string) => {
    this._id = id;
    const { identifier, type } = Inventory.splitId(id);
    this._type = type;
    this._identifier = identifier;
    this.items = new Set();

    const fixedSizes = getConfig().amountOfSlots;
    this.size = fixedSizes[this.type] ?? 0;

    if (this.type === 'container') {
      // Item manager only contains items from loaded inventories, when opening containerinv using admin menu. The item might possibly not be loaded
      const containerItem = await Inventory.getItemStateFromDatabase(this.identifier);
      if (!containerItem) {
        this.logger.error('`Tried to open container inventory but container item does not exist`');
        Util.Log(
          'inventory:invalidContainer',
          {
            identifier: this.identifier,
          },
          `Tried to open container inventory but container item does not exist`,
          undefined,
          true
        );
        return;
      }
      const name = containerItem.name;
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

    this.logger.debug(`Inventory ${this.id} loaded`);
    this._isLoaded = true;
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
  public set allowedItems(value: typeof this._allowedItems) {
    this._allowedItems = value;
  }
  public get isLoaded() {
    return this._isLoaded;
  }
  // #endregion

  public registerItemId = (itemState: Inventory.ItemState, checkSave = false) => {
    if (this.items.size == 0 && this.type === 'drop') locationManager.activateDrop(this.id);
    this.items.add(itemState.id);
    this.updatedInv('add', itemState);

    if (checkSave && contextManager.getPlayersById(this.id).length === 0) {
      this.logger.debug(`Saving ${this.id} because no one had it open`);
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

    const serverId = DGCore.Functions.getPlyIdForCid(Number(this.identifier));
    if (serverId) {
      emitNet('inventory:updateCache', serverId, action, itemState.name);

      const newInv = await inventoryManager.get(itemState.inventory);
      if (newInv.type === 'drop' && newInv.items.size === 0) {
        emitNet('inventory:doDropAnimation', serverId);
      }

      // If item has associated obj
      if (objectsUtility.config?.items[itemState.name]) {
        Events.emitNet('inventory:client:updateObject', serverId, action, { id: itemState.id, name: itemState.name });
      }
    }
  };

  public hasItemId = (itemId: string) => {
    return this.items.has(itemId);
  };

  public getItems = () => {
    const items: Item[] = [];
    this.items.forEach(id => {
      const item = itemManager.get(id);
      if (item === undefined) return;
      items.push(item);
    });
    return items;
  };

  public getItemStates = () => {
    return this.getItems().map(i => i.state);
  };

  public getItemStatesForName = (itemName: string) => {
    const items: Inventory.ItemState[] = [];
    this.getItems().forEach(item => {
      if (item.state.name !== itemName) return;
      items.push(item.state);
    });
    return items;
  };

  public getFirstAvailablePosition = (itemName: string, rotated = false) => {
    const itemSize = itemDataManager.get(itemName).size;
    const rotatedItemSize = {
      x: itemSize[rotated ? 'y' : 'x'],
      y: itemSize[rotated ? 'x' : 'y'],
    };

    const cellsPerRow = getConfig().cellsPerRow;
    const itemsThatMayOverlap = this.getItemStates().map(state => {
      const size = itemDataManager.get(state.name).size;
      return [
        state.position,
        {
          x: state.position.x + size[state.rotated ? 'y' : 'x'],
          y: state.position.y + size[state.rotated ? 'x' : 'y'],
        },
      ] as [Vec2, Vec2];
    });

    for (let y = 0; y < this.size - rotatedItemSize.y + 1; y++) {
      for (let x = 0; x < cellsPerRow - rotatedItemSize.x + 1; x++) {
        const anyOverlapping = itemsThatMayOverlap.some(i =>
          doRectanglesOverlap(
            [
              { x, y },
              { x: x + rotatedItemSize.x, y: y + rotatedItemSize.y },
            ],
            i
          )
        );
        if (anyOverlapping) continue;
        return { x, y };
      }
    }
  };

  public save = () => {
    if (this.items.size == 0) {
      if (locationManager.isLocationBased(this.type))
        locationManager.removeLocation(this.type as Location.Type, this.id);
      return;
    }
    let itemStates = this.getItemStates();
    // If inv is not persistent we save the items under inventory id 'nonpersistent'. These get removed from db on resource start
    // By not deleting them from db immediatly we never need to recreate an item in db if item gets moved back to persistent inv
    if (!this.isPersistent()) {
      itemStates = itemStates.map(state => ({ ...state, inventory: 'nonpersistent' }));
    }
    repository.updateItems(itemStates);
    this.logger.debug(`Inventory ${this.id} has been saved`);
  };

  public isPersistent = () => {
    const cfg = getConfig();
    if (cfg.persistentTypes.includes(this.type)) return true;
    if (cfg.vehicleTypes.includes(this.type)) {
      return global.exports['dg-vehicles'].isVinFromPlayerVeh(this.identifier);
    }
    return false;
  };

  public hasObject = () => {
    const items = this.getItemStates();
    const objectItems = objectsUtility.config?.items ?? {};
    return items.some(item => {
      const info = objectItems[item.name];
      if (!info) return false;
      return info.position === 'primary';
    });
  };

  public destroyAllItems = () => {
    const itemIds: string[] = [];
    [...this.items].forEach(id => {
      const item = itemManager.get(id);
      if (item) {
        item.destroy(true);
        itemIds.push(item.state.id);
      }
    });

    Util.Log(
      'inventory:inventory:destroyAll',
      {
        inventoryId: this.id,
        itemId: itemIds,
      },
      `All items in ${this.id} have been destroyed`
    );
  };
}
