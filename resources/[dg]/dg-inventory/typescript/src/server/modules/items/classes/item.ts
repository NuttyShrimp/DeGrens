import { Events, Notifications, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import inventoryManager from '../../inventories/manager.inventories';
import repository from 'services/repository';
import { Inv } from 'modules/inventories/classes/inv';
import itemDataManager from 'classes/itemdatamanager';
import itemManager from '../manager.items';
import locationManager from 'modules/locations/manager.locations';
import { concatId, splitId } from '../../../util';
import contextManager from 'classes/contextmanager';

export class Item {
  private readonly logger: winston.Logger;
  private id!: string;
  private name!: string;
  private inventory!: Inv;
  private position!: Vec2;
  private rotated!: boolean;
  private quality!: number;
  private hotkey!: Inventory.Hotkey | null;
  private metadata!: { [key: string]: any };
  private lastDecayTime!: number;

  constructor() {
    this.logger = mainLogger.child({ module: 'Item' });
  }

  public init = async ({ state, isNew }: { state: ItemBuildData & { id: string }; isNew: boolean }) => {
    this.id = state.id;
    this.name = state.name;
    // Do not check if loaded because this shit gets called inside inv loading func which causes infinite loop
    this.inventory = await inventoryManager.get(state.inventory, false);
    this.rotated = state.rotated ?? false;
    this.quality = state.quality ?? 100;
    this.hotkey = state.hotkey ?? null;
    this.lastDecayTime = state.lastDecayTime ?? Math.floor(Date.now() / 1000); // Seconds
    this.metadata = state.metadata;

    // Position
    if (isNew && !state.position) {
      let newPosition = this.inventory.getFirstAvailablePosition(this.name);
      // If we didnt find a position because inv is full, we drop item on ground
      if (!newPosition) {
        // This can happen when adding item to stash by script (mechanic crafting for exampel)
        if (this.inventory.type === 'player') {
          const cid = splitId(this.inventory.id).identifier;
          const source = DGCore.Functions.GetPlayerByCitizenId(Number(cid)).PlayerData.source;
          const coords = Util.getPlyCoords(source);

          let dropId = locationManager.getLocation('drop', coords);
          this.inventory = await inventoryManager.get(dropId);
          newPosition = this.inventory.getFirstAvailablePosition(this.name);
          // if somehow the drop is also full, we add it to a new drop at position
          if (!newPosition) {
            dropId = locationManager.getLocation('drop', coords, true);
            this.inventory = await inventoryManager.get(dropId);
            newPosition = { x: 0, y: 0 };
          }
          Notifications.add(source, 'Voorwerp ligt op de grond, je zakken zitten vol', 'error');
        } else {
          newPosition = { x: 0, y: 0 };
        }
      }
      this.position = newPosition;

      // Max date item can life to
      const destroyDate = itemDataManager.getDestroyDate(this.name, 100);
      // When adding new item to nonpresistent inventory, start inv as nonpersistent.
      const dbInventory = this.inventory.isPersistent() ? this.state.inventory : 'nonpersistent';
      repository.createItem({ ...this.state, inventory: dbInventory }, destroyDate);
      this.logger.info(`New item has been created with id ${this.id}`);
      Util.Log(
        'inventory:item:create',
        {
          itemId: this.id,
          position: this.position,
          invId: state.inventory,
        },
        `Item ${this.name} has been created`
      );
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
      quality: this.quality,
      hotkey: this.hotkey,
      metadata: this.metadata,
      lastDecayTime: this.lastDecayTime,
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
    this.logger.info(`Item ${this.id} has been used`);
    emit('inventory:usedItem', src, this.state);
    const itemImage = itemDataManager.get(this.name).image;
    if (hotkey) Events.emitNet('inventory:client:addItemBox', src, 'Gebruikt', itemImage);
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
    const playerInvId = concatId('player', Util.getCID(src));
    if (playerInvId !== this.inventory.id) {
      return false;
    }
    return true;
  };

  public setMetadata = (cb: (old: { [key: string]: any }) => { [key: string]: any }) => {
    this.metadata = cb(this.getMetadata());
  };

  public getMetadata = () => this.metadata;

  public setQuality = (cb: (current: number) => number) => {
    const newQuality = cb(this.quality);
    const clampedNewQuality = Math.min(Math.max(newQuality, 0), 100);

    if (clampedNewQuality === 0) {
      this.destroy();
    }

    // Update destroydate when increasing quality
    if (clampedNewQuality > this.quality) {
      const destroyDate = itemDataManager.getDestroyDate(this.name, clampedNewQuality);
      repository.updateDestroyDate(this.id, destroyDate);
    }

    this.quality = clampedNewQuality;
  };

  public destroy = () => {
    this.inventory.unregisterItemId(this.state); // delete from inventory it was in
    itemManager.remove(this.id); // remove in item manager
    repository.deleteItem(this.id); // remove from db
    this.logger.info(`${this.id} has been destroyed. Quality: ${this.quality}`);
    Util.Log(
      'inventory:item:destroyed',
      {
        ...this.state,
      },
      `${this.name} got destroyed (${Math.ceil(this.quality)}% quality remaining)`
    );
    this.syncItem({ ...this.state, inventory: 'destroyed' }, this.inventory.id);
  };

  /**
   * @returns Returns true if item broke
   */
  public checkDecay = () => {
    const itemData = itemDataManager.get(this.name);
    if (!itemData.decayRate) return false;
    if (this.inventory.type === 'shop') return false;
    const decayPerSecond = 100 / (itemData.decayRate * 60);
    const currentSeconds = Math.floor(Date.now() / 1000);
    const secondsSinceLastDecay = currentSeconds - this.lastDecayTime;
    const amountToDecay = secondsSinceLastDecay * decayPerSecond;
    this.lastDecayTime = currentSeconds;
    this.setQuality(current => current - amountToDecay);
    return this.quality === 0;
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
