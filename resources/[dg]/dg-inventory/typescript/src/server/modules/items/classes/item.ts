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

  constructor() {
    this.logger = mainLogger.child({ module: 'Item' });
  }

  public init = async ({ state, isNew }: { state: ItemBuildData & { id: string }; isNew: boolean }) => {
    this.id = state.id;
    this.name = state.name;
    // Do not check if loaded because this shit gets called inside inv loading func which causes infinite loop
    this.inventory = await inventoryManager.get(state.inventory, false);
    this.rotated = state.rotated ?? false;
    this.hotkey = state.hotkey ?? null;
    this.destroyDate = state.destroyDate ?? itemDataManager.getInitialDestroyDate(state.name);
    this.metadata = state.metadata;

    // Position
    if (isNew && !state.position) {
      let newPosition = this.inventory.getFirstAvailablePosition(this.name);
      // If we didnt find a position because inv is full, we drop item on ground
      if (!newPosition) {
        // This can happen when adding item to stash by script (mechanic crafting for exampel)
        if (this.inventory.type === 'player') {
          const cid = Inventory.splitId(this.inventory.id).identifier;
          const plyId = DGCore.Functions.getPlyIdForCid(Number(cid));

          if (plyId) {
            const coords = Util.getPlyCoords(plyId);

            let dropId = locationManager.getLocation('drop', coords);
            this.inventory = await inventoryManager.get(dropId);
            newPosition = this.inventory.getFirstAvailablePosition(this.name);
            // if somehow the drop is also full, we add it to a new drop at position
            if (!newPosition) {
              dropId = locationManager.getLocation('drop', coords, true);
              this.inventory = await inventoryManager.get(dropId);
              newPosition = { x: 0, y: 0 };
            }
            Notifications.add(plyId, 'Voorwerp ligt op de grond, je zakken zitten vol', 'error');
          } else {
            newPosition = { x: 0, y: 0 };
          }
        } else {
          newPosition = { x: 0, y: 0 };
        }
      }
      this.position = newPosition;

      // When adding new item to nonpresistent inventory, start inv as nonpersistent.
      const dbInventory = this.inventory.isPersistent() ? this.state.inventory : 'nonpersistent';
      repository.createItem({ ...this.state, inventory: dbInventory });
      this.logger.debug(`New item has been created with id ${this.id}`);
    } else {
      this.position = state.position ?? { x: 0, y: 0 };
    }

    this.inventory.registerItemId(this.state);
    this.syncItem(this.state);
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

  public move = async (src: number, position: Vec2, rotated: boolean, invId: string) => {
    const oldInvId = this.inventory.id;
    this.position = position;
    this.rotated = rotated;
    if (this.inventory.id !== invId) {
      // auto unbind when moving to other inv
      if (this.hotkey) {
        this.hotkey = null;
      }

      const oldInv = this.inventory;
      const newInv = await inventoryManager.get(invId);
      this.inventory = newInv;

      oldInv.unregisterItemId(this.state);
      newInv.registerItemId(this.state, true);
    }
    this.syncItem(this.state, oldInvId, src);
  };

  public use = (src: number, hotkey: boolean) => {
    if (!this.canUse(src)) return;
    this.logger.debug(`Item ${this.id} has been used`);
    emit('inventory:usedItem', src, this.state);
    const itemImage = itemDataManager.get(this.name).image;
    if (hotkey) emitNet('inventory:addItemBox', src, 'Gebruikt', itemImage);
    Util.Log(
      'inventory:item:used',
      {
        itemId: this.id,
      },
      `${Util.getName(src)} used ${this.name}`,
      src
    );
  };

  public bind = (src: number, key: Inventory.Hotkey) => {
    if (!this.canUse(src)) return;
    this.hotkey = key;
  };

  public unbind = (src: number) => {
    if (!this.canUse(src)) return;
    this.hotkey = null;
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

    this.checkDecay(noItemBoxOnBreak);
  };

  public destroy = (noItemBox = false) => {
    const originalInvType = this.inventory.type;
    const originalInvIdentifier = this.inventory.identifier;

    this.inventory.unregisterItemId(this.state); // delete from inventory it was in
    itemManager.remove(this.id); // remove in item manager
    repository.deleteItem(this.id); // remove from db
    const quality = itemDataManager.getItemQuality(this.name, this.destroyDate);
    this.logger.debug(`${this.id} has been destroyed. Quality: ${quality}`, 'destroyDate', this.destroyDate);
    this.syncItem({ ...this.state, inventory: 'destroyed' }, this.inventory.id);

    Util.Log(
      'inventory:item:destroyed',
      {
        itemId: this.id,
        itemName: this.name,
        state: this.state,
      },
      `${this.name} got destroyed (${quality}% quality)`
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
    let isDestroyed = unixNow > this.destroyDate;
    if (isDestroyed) {
      this.destroy(noItemBoxOnBreak);
    }

    return isDestroyed;
  };

  private syncItem = (data: Inventory.ItemState, oldInventory = '', emitter = 0) => {
    const inventories = data.inventory === oldInventory ? [data.inventory] : [data.inventory, oldInventory];
    for (const inv of inventories) {
      const plyWithOpen = contextManager.getPlayersById(inv);
      plyWithOpen.forEach(ply => {
        if (ply === emitter) return;
        Events.emitNet('inventory:client:syncItem', ply, data);
      });
    }
  };
}
