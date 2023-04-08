import { Events, Notifications, Util, Inventory } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import inventoryManager from '../../inventories/manager.inventories';
import repository from 'services/repository';
import { Inv } from 'modules/inventories/classes/inv';
import itemDataManager from 'classes/itemdatamanager';
import itemManager from '../manager.items';
import locationManager from 'modules/locations/manager.locations';
import contextManager from 'classes/contextmanager';

export class Item {
  private readonly logger: winston.Logger;
  private id!: string;
  private name!: string;
  private inventory!: Inv;
  private position!: Vec2;
  private rotated!: boolean;
  private hotkey!: Inventory.Hotkey | null;
  private metadata!: { [key: string]: any };
  private destroyDate!: number | null;

  public isDirty: boolean;

  constructor() {
    this.logger = mainLogger.child({ module: 'Item' });
    this.isDirty = false;
  }

  public init = async ({ state, isNew }: { state: ItemBuildData & { id: string }; isNew: boolean }) => {
    this.id = state.id;
    this.name = state.name;
    // Do not check if loaded because this shit gets called inside inv loading func which causes infinite loop
    this.inventory = await inventoryManager.get(state.inventory, false);
    this.hotkey = state.hotkey ?? null;
    this.destroyDate = state.destroyDate ?? itemDataManager.getInitialDestroyDate(state.name);
    this.metadata = state.metadata;

    const itemSize = itemDataManager.get(this.name).size;

    let finalPosition: Vec2 = state.position ?? { x: 0, y: 0 };
    let finalRotated = state.rotated ?? false;

    // position logic if item is new
    if (isNew && (!state.position || !this.inventory.isGridSpotFree(state.position, itemSize, state.rotated))) {
      const availablePosition = this.inventory.getFirstAvailablePosition(itemSize, state.rotated);

      if (availablePosition) {
        finalPosition = availablePosition.position;
        finalRotated = availablePosition.rotated;
      } else {
        // This can happen when adding item to stash by script (mechanic crafting for exampel)
        if (this.inventory.type === 'player') {
          const cid = Inventory.splitId(this.inventory.id).identifier;
          const plyId = DGCore.Functions.getPlyIdForCid(Number(cid));

          if (plyId) {
            const coords = Util.getPlyCoords(plyId);

            let dropId = locationManager.getLocation('drop', coords);
            this.inventory = await inventoryManager.get(dropId);
            const availableInDrop = this.inventory.getFirstAvailablePosition(itemSize, state.rotated);

            // if somehow the drop is also full, we add it to a new drop at position
            if (!availableInDrop) {
              dropId = locationManager.getLocation('drop', coords, true);
              this.inventory = await inventoryManager.get(dropId);
              this.position = { x: 0, y: 0 };
            } else {
              this.position = availableInDrop.position;
              this.rotated = availableInDrop.rotated;
            }

            Notifications.add(plyId, 'Voorwerp ligt op de grond, je zakken zitten vol', 'error');
          }
        }
      }
    }

    this.position = finalPosition;
    this.rotated = finalRotated;

    // save when item is new
    if (isNew) {
      // When adding new item to nonpresistent inventory, start inv as nonpersistent.
      const dbInventory = this.inventory.isPersistent() ? this.state.inventory : 'nonpersistent';
      repository.updateItems([{ ...this.state, inventory: dbInventory }]);
      this.logger.debug(`New item has been created with id ${this.id}`);
    }

    this.inventory.registerItemId(this.state);
    this.inventory.setGridSpacesOccupied(true, this.position, itemSize, this.rotated);
    itemManager.syncItems(this.state, [this.inventory.id]);
  };

  // #region Getters/Setters
  public get state(): Inventory.ItemState {
    return {
      id: this.id,
      name: this.name,
      inventory: this.inventory?.id,
      position: this.position,
      rotated: this.rotated,
      hotkey: this.hotkey,
      metadata: this.metadata,
      destroyDate: this.destroyDate,
      quality: this.destroyDate ? itemDataManager.getItemQuality(this.name, this.destroyDate) : undefined,
    };
  }
  // #endregion

  /**
   * @param skipGridSpotFreeCheck use when provided position/rotation is gotten from getFreeSpot function
   */
  public move = (newInv: Inv, position: Vec2, rotated: boolean, skipGridSpotFreeCheck = false) => {
    const itemSize = itemDataManager.get(this.name).size;

    const oldInv = this.inventory;
    oldInv.setGridSpacesOccupied(false, this.position, itemSize, this.rotated);

    // if position/rotatioin is not available, overwrite position/rotation
    // if we overwrite we make sure to sync to emitter by returning true
    let syncToEmitter = false;
    if (!skipGridSpotFreeCheck && !newInv.isGridSpotFree(position, itemSize, rotated)) {
      const availablePosition = newInv.getFirstAvailablePosition(itemSize, rotated); // prefer provided rotation
      position = availablePosition?.position ?? { x: 0, y: 0 };
      rotated = availablePosition?.rotated ?? false;
      syncToEmitter = true;
    }

    this.position = position;
    this.rotated = rotated;

    // handle inv switchinhS
    if (oldInv.id !== newInv.id) {
      // auto unbind when moving to other inv
      if (this.hotkey) {
        this.hotkey = null;
      }

      this.inventory = newInv;

      oldInv.unregisterItemId(this.state);
      newInv.registerItemId(this.state, true);
    }

    newInv.setGridSpacesOccupied(true, this.position, itemSize, this.rotated);

    this.isDirty = true;

    return syncToEmitter;
  };

  public use = (src: number, hotkey = false) => {
    if (!this.canUse(src)) return;
    this.logger.debug(`Item ${this.id} has been used`);
    const itemImage = itemDataManager.get(this.name).image;
    if (hotkey) emitNet('inventory:addItemBox', src, 'Gebruikt', itemImage);
    Util.Log(
      'inventory:item:used',
      {
        itemId: this.id,
        itemName: this.name,
      },
      `${Util.getName(src)} used ${this.name}`,
      src
    );

    emit('inventory:usedItem', src, this.state);
  };

  public bind = (src: number, key: Inventory.Hotkey) => {
    if (!this.canUse(src)) return;
    this.hotkey = key;
    this.isDirty = true;
  };

  public unbind = (src: number) => {
    if (!this.canUse(src)) return;
    this.hotkey = null;
    this.isDirty = true;
  };

  private canUse = (src: number) => {
    // Check if item is useable
    const itemData = itemDataManager.get(this.name);
    if (!itemData.useable) {
      this.logger.warn(`Tried to use/(un)bind unuseable item ${this.name} - ${this.id}`);
      return false;
    }
    // Check if item is in player inventory
    const playerInvId = Inventory.concatId('player', Util.getCID(src));
    if (playerInvId !== this.inventory.id) {
      return false;
    }
    return true;
  };

  public setMetadata = (cb: (old: { [key: string]: any }) => { [key: string]: any }) => {
    this.metadata = cb(this.getMetadata());
    this.isDirty = true;
  };

  public getMetadata = () => this.metadata;

  // This is only called from third-party's, a change in quality == DestroyDate is getting modified
  public setQuality = (cb: (current: number) => number, noItemBoxOnBreak = false) => {
    if (!this.destroyDate) return;
    const oldQuality = itemDataManager.getItemQuality(this.name, this.destroyDate);
    const newQuality = cb(oldQuality);
    const clampedNewQuality = Math.min(Math.max(newQuality, 0), 100);
    const newDestroyDate = itemDataManager.getModifiedDestroyDate(
      this.name,
      this.destroyDate,
      clampedNewQuality - oldQuality
    );

    this.destroyDate = newDestroyDate;

    const destroyed = this.checkDecay(noItemBoxOnBreak);

    if (!destroyed) {
      this.isDirty = true;
    }
  };

  public destroy = (noItemBox = false) => {
    const originalInvType = this.inventory.type;
    const originalInvIdentifier = this.inventory.identifier;

    const itemSize = itemDataManager.get(this.name)?.size;

    this.inventory.unregisterItemId(this.state); // delete from inventory it was in
    this.inventory.setGridSpacesOccupied(false, this.position, itemSize, this.rotated);
    itemManager.remove(this.id); // remove in item manager
    repository.deleteItem(this.id); // remove from db
    itemManager.syncItems({ ...this.state, inventory: 'destroyed' }, [this.inventory.id]); // provide newInventory as 'destroyed' so client will remove it as visible item
    this.isDirty = false;

    const logMsg = `${this.id} has been destroyed`;
    this.logger.debug(logMsg);
    Util.Log(
      'inventory:item:destroyed',
      {
        itemId: this.id,
        itemName: this.name,
        state: this.state,
      },
      logMsg
    );

    if (!noItemBox && originalInvType === 'player') {
      const image = itemDataManager.get(this.name).image;
      const plyId = DGCore.Functions.getPlyIdForCid(Number(originalInvIdentifier));
      if (plyId) {
        emitNet('inventory:addItemBox', plyId, 'Verwijderd', image);
      }
    }
  };

  /**
   * @returns Returns true if item broke
   */
  public checkDecay = (noItemBoxOnBreak = false) => {
    const itemData = itemDataManager.get(this.name);
    if (!itemData.decayRate || !this.destroyDate) return false;
    if (this.inventory.type === 'shop') return false;

    const unixNow = Math.floor(Date.now() / 1000);
    let isDestroyed = unixNow >= this.destroyDate;
    if (isDestroyed) {
      this.destroy(noItemBoxOnBreak);
    }

    return isDestroyed;
  };
}
