import { Events, Notifications, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import inventoryManager from '../../inventories/manager.inventories';
import repository from 'services/repository';
import { Inv } from 'modules/inventories/classes/inv';
import itemDataManager from 'modules/itemdata/classes/itemdatamanager';
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
  private quality!: number;
  private hotkey!: Inventory.Hotkey | null;
  private metadata!: { [key: string]: any };
  private lastDecayTime!: number;
  private requirements?: Inventory.Requirements;

  constructor() {
    this.logger = mainLogger.child({ module: 'Item' });
  }

  public init = async ({ state, isNew }: { state: ItemBuildData & { id: string }; isNew: boolean }) => {
    this.id = state.id;
    this.name = state.name;
    // Do not check if loaded because this shit gets called inside inv loading func which causes infinite loop
    this.inventory = await inventoryManager.get(state.inventory, false);
    this.quality = state.quality ?? 100;
    this.hotkey = state.hotkey ?? null;
    this.lastDecayTime = state.lastDecayTime ?? Math.floor(Date.now() / 1000); // Seconds
    this.metadata = state.metadata;

    // Position
    if (isNew) {
      let newPosition = this.inventory.getFirstAvailablePosition(this.name);
      // If we didnt find a position because inv is full, we drop item on ground
      if (!newPosition) {
        if (this.inventory.type !== 'player')
          throw new Error('Tried to add overflowing item to drop but overflowing inventory is not a player');

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
      }
      this.position = newPosition;

      repository.createItem(this.state);
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
      this.position = state.position!;
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
      quality: this.quality,
      hotkey: this.hotkey,
      metadata: this.metadata,
      lastDecayTime: this.lastDecayTime,
      requirements: this.requirements,
    };
  }
  // #endregion

  public move = async (src: number, position: Vec2, invId: string) => {
    const oldInvId = this.inventory.id;
    this.position = position;
    if (this.inventory.id !== invId) {
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
      `${GetPlayerName(String(src))} used ${this.name}`,
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
      this.logger.error(`Player tried to use/(un)bind item ${this.id} in different inventory ${this.inventory}`);
      return false;
    }
    return true;
  };

  public setMetadata = (cb: (old: { [key: string]: any }) => { [key: string]: any }) => {
    this.metadata = cb(this.getMetadata());
  };

  public getMetadata = () => this.metadata;

  public setQuality = (cb: (current: number) => number) => {
    let newQuality = cb(this.quality);
    newQuality = Math.min(Math.max(newQuality, 0), 100);
    if (newQuality === 0) {
      this.destroy();
    }
    this.quality = newQuality;
  };

  public destroy = () => {
    this.inventory.unregisterItemId(this.state); // delete from inventory it was in
    itemManager.remove(this.id); // remove in item manager
    repository.deleteItem(this.id); // remove from db
    this.logger.info(`${this.id} has been destroyed. Quality: ${this.quality}`);
    Util.Log(
      'inventory:item:destroyed',
      {
        itemId: this.id,
        quality: this.quality,
      },
      `${this.name} got destroyed (${this.quality}% quality remaining)`
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

  // Requirements for moving, used in shops/crafting
  public getRequirements = () => {
    return this.requirements;
  };

  public setRequirements = (requirements: Inventory.Requirements) => {
    this.requirements = { ...requirements };
  };

  public clearRequirements = () => {
    this.requirements = undefined;
  };

  private syncItem = (data: Inventory.ItemState, oldInventory = '', emitter = 0) => {
    [...new Set([data.inventory, oldInventory])].forEach(inv => {
      const plyWithOpen = contextManager.getPlayersById(inv);
      plyWithOpen
        .filter(ply => ply !== emitter)
        .forEach(ply => {
          Events.emitNet('inventory:client:syncItem', ply, data);
        });
    });
  };
}
