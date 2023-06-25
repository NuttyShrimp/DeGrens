import { Events, Inventory, Util, Vehicles } from '@dgx/server';
import itemManager from 'modules/items/manager.items';
import locationManager from 'modules/locations/manager.locations';
import repository from 'services/repository';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import inventoryManager from '../manager.inventories';
import itemDataManager from 'classes/itemdatamanager';
import { getConfig } from 'services/config';
import contextManager from 'classes/contextmanager';
import { getContainerInfo, isItemAContainer } from 'modules/containers/service.containers';
import objectsUtility from 'classes/objectsutility';
import { Item } from 'modules/items/classes/item';
import { charModule } from 'services/core';

// conflicted with Inventory types namespace so I went with the good old Inv
export class Inv {
  private readonly logger: winston.Logger;
  private _id!: string;
  private _type!: Inventory.Type;
  private _identifier!: string;
  private _size!: number;
  private readonly items: Set<string>;
  private _allowedItems?: string[];
  private readonly containerInventories: Map<string, Inv>; // cache seperately to avoid iteration when needed

  private grid: boolean[][];

  private _isLoaded: boolean;

  constructor() {
    this.logger = mainLogger.child({ module: 'Inventory' });
    this.items = new Set();
    this.containerInventories = new Map();
    this.grid = [];
    this._isLoaded = false;
  }

  public init = async (id: string) => {
    this._id = id;
    const { identifier, type } = Inventory.splitId(id);
    this._type = type;
    this._identifier = identifier;

    const fixedSizes = getConfig().amountOfSlots;
    this.setSize(fixedSizes[this.type] ?? 0);

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
      this.setSize(size);
    } else if (this.type === 'tunes') {
      this.allowedItems = (global.exports['dg-vehicles'].getTuneItemNames(this.identifier) as string[]) ?? [];
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
  private set size(value: typeof this._size) {
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
    if (isItemAContainer(itemState.name)) {
      if (this.type !== 'container') {
        inventoryManager.get(Inventory.concatId('container', itemState.id)).then(inv => {
          if (!this.items.has(itemState.id)) return; // this ensured item was not removed while promise was resolving
          this.containerInventories.set(itemState.id, inv);
        });
      } else {
        this.logger.error(`Tried to add container ${itemState.id} to container ${this.id}`);
      }
    }
    this.updatedInv('add', itemState);

    if (checkSave && contextManager.getPlayersById(this.id).length === 0) {
      this.logger.debug(`Saving ${this.id} because no one had it open`);
      this.save();
    }
  };

  public unregisterItemId = (itemState: Inventory.ItemState) => {
    this.items.delete(itemState.id);
    this.containerInventories.delete(itemState.id);
    this.updatedInv('remove', itemState);
  };

  private updatedInv = async (action: 'add' | 'remove', itemState: Inventory.ItemState) => {
    emit('inventory:inventoryUpdated', this.type, this.identifier, action, itemState);

    if (this.type !== 'player') return;

    const serverId = charModule.getServerIdFromCitizenId(Number(this.identifier));
    if (!serverId) return;

    const newInv = await inventoryManager.get(itemState.inventory);
    if (newInv.type === 'drop' && newInv.items.size <= 1) {
      emitNet('inventory:doDropAnimation', serverId);
    }

    // If item has associated obj
    if (objectsUtility.config?.items[itemState.name]) {
      Events.emitNet('inventory:client:updateObject', serverId, action, { id: itemState.id, name: itemState.name });
    }
  };

  public hasItemId = (itemId: string) => {
    if (this.items.has(itemId)) return true;

    for (const [_, containerInv] of this.containerInventories) {
      if (containerInv.hasItemId(itemId)) return true;
    }

    return false;
  };

  public getItems = (ignoreContainers = false) => {
    const items: Item[] = [];
    for (const id of this.items) {
      const item = itemManager.get(id);
      if (item === undefined) continue;
      items.push(item);
    }
    if (!ignoreContainers) {
      for (const [_, containerInv] of this.containerInventories) {
        items.push(...containerInv.getItems());
      }
    }
    return items;
  };

  public getItemStates = () => {
    return this.getItems().map(item => item.state);
  };

  public getItemStatesForName = (itemName: string) => {
    return this.getItemStates().filter(s => s.name === itemName);
  };

  /**
   * @param oldRotation Used to prefer new position being same rotation
   */
  public getFirstAvailablePosition = (itemSize: Vec2, preferedRotation = false) => {
    const cellsPerRow = getConfig().cellsPerRow;

    const minSizeSide = Math.min(itemSize.x, itemSize.y);
    const maxYToCheck = this.size - minSizeSide + 1;
    const maxXToCheck = cellsPerRow - minSizeSide + 1;

    for (let y = 0; y < maxYToCheck; y++) {
      for (let x = 0; x < maxXToCheck; x++) {
        if (this.isGridSpotFree({ x, y }, itemSize, preferedRotation)) {
          return { position: { x, y }, rotated: preferedRotation };
        }
        if (this.isGridSpotFree({ x, y }, itemSize, !preferedRotation)) {
          return { position: { x, y }, rotated: !preferedRotation };
        }
      }
    }
  };

  public isGridSpotFree = (position: Vec2, size: Vec2, rotated = false) => {
    const maxX = position.x + size[rotated ? 'y' : 'x'];
    const maxY = position.y + size[rotated ? 'x' : 'y'];

    for (let x = position.x; x < maxX; x++) {
      const column = this.grid[x];
      if (column === undefined) return false;

      for (let y = position.y; y < maxY; y++) {
        if (column[y] || column[y] === undefined) return false;
      }
    }

    return true;
  };

  public save = () => {
    if (this.items.size == 0) {
      if (locationManager.isLocationBased(this.type))
        locationManager.removeLocation(this.type as Location.Type, this.id);
      return;
    }

    const dirtyItemStates: Inventory.ItemState[] = [];
    for (const id of this.items) {
      const item = itemManager.get(id);
      if (item === undefined) continue;
      if (!item.isDirty) continue;
      dirtyItemStates.push(item.state);
      item.isDirty = false;
    }

    if (dirtyItemStates.length === 0) return;

    // If inv is not persistent we save the items under inventory id 'nonpersistent'. These get removed from db on resource start
    // By not deleting them from db immediatly we never need to recreate an item in db if item gets moved back to persistent inv
    if (!this.isPersistent()) {
      for (const itemState of dirtyItemStates) {
        itemState.inventory = 'nonpersistent';
      }
    }

    repository.updateItems(dirtyItemStates);
    this.logger.debug(`Inventory ${this.id} has been saved`);
  };

  public isPersistent = () => {
    const cfg = getConfig();
    if (cfg.persistentTypes.includes(this.type)) return true;
    if (cfg.vehicleTypes.includes(this.type)) {
      return Vehicles.isVinFromPlayerVeh(this.identifier);
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
    const itemNames: string[] = [];
    this.getItems().forEach(item => {
      itemIds.push(item.state.id);
      itemNames.push(item.state.name);
      item.destroy(true);
    });

    Util.Log(
      'inventory:inventory:destroyAll',
      {
        inventoryId: this.id,
        itemId: itemIds,
        itemName: itemNames,
      },
      `All items in ${this.id} have been destroyed`
    );
  };

  public setSize = (size: number) => {
    this.size = size;

    // rebuild grid
    this.grid = [...new Array(getConfig().cellsPerRow)].map(() => new Array(this.size).fill(false));

    for (const id of this.items) {
      const item = itemManager.get(id);
      if (!item) continue;
      const itemState = item.state;
      const size = itemDataManager.get(itemState.name).size;
      this.setGridSpacesOccupied(true, itemState.position, size, itemState.rotated);
    }
  };

  public setGridSpacesOccupied = (occupied: boolean, position: Vec2, size: Vec2, rotated: boolean) => {
    const maxX = position.x + size[rotated ? 'y' : 'x'];
    const maxY = position.y + size[rotated ? 'x' : 'y'];

    for (let x = position.x; x < maxX; x++) {
      for (let y = position.y; y < maxY; y++) {
        this.grid[x][y] = occupied;
      }
    }
  };
}
