import { SQL, SyncedObjects, UI, Util, Inventory, Notifications, Jobs } from '@dgx/server';
import { MODELS_PER_STAGE } from '../constants.weed';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { getCurrentSeconds } from '../service.weed';
import weedPlantManager from './weedplantmanager';

export class WeedPlant {
  private object: { id: string; stage: number } | null;
  private logger: winston.Logger;

  constructor(
    private readonly id: number,
    private readonly coords: Vec3,
    private readonly rotation: Vec3,
    private readonly gender: Criminal.Weed.Gender,
    public readonly plantTime: number,
    private cid: number,
    private foodType: Criminal.Weed.FoodType = 'none',
    private waterTime: number = 0
  ) {
    this.object = null;
    this.logger = mainLogger.child({ module: `WeedPlant #${this.id}` });

    this.spawnObject();
  }

  private spawnObject = async (stage: number = this.getStage()) => {
    const [objectId] = await SyncedObjects.add({
      model: MODELS_PER_STAGE[stage],
      coords: this.coords,
      rotation: this.rotation,
      flags: {
        weedPlantId: this.id,
      },
      skipStore: true,
    });
    this.object = {
      id: objectId,
      stage,
    };
  };

  private destroyObject = async () => {
    if (this.object == null) return;

    await SyncedObjects.remove(this.object.id);
    this.object = null;
  };

  public view = async (plyId: number) => {
    if (!this.object) return;

    const stage = this.getStage();

    const ageInMinutes = Math.floor((getCurrentSeconds() - this.plantTime) / 60);
    const ageLabel = `${Math.floor(ageInMinutes / 60)}h ${ageInMinutes % 60}m`;

    const menuEntries: ContextMenu.Entry[] = [
      {
        title: `Gender: ${this.gender === 'male' ? 'Mannelijk' : 'Vrouwelijk'}`,
        disabled: true,
        icon: 'venus-mars',
      },
      {
        title: `Leeftijd: ${ageLabel}`,
        disabled: true,
        icon: 'droplet-percent',
      },
    ];

    // only police can destroy
    if (Jobs.getCurrentJob(plyId) === 'police') {
      menuEntries.push({
        title: 'Kapot Maken',
        icon: 'hammer-crash',
        callbackURL: 'criminal/weed/destroy',
        data: {
          plantId: this.id,
          objectId: this.object.id,
        },
      });
    }

    if (stage === 0 && (this.foodType === 'none' || this.waterTime === 0)) {
      const plyItems = await Inventory.getPlayerItems(plyId);

      // only if not fed yet
      if (this.foodType === 'none') {
        const hasFertilizer = plyItems.some(i => i.name === 'farming_fertilizer');
        const hasDeluxeFertilizer = plyItems.some(i => i.name === 'farming_fertilizer_deluxe');

        const feedSubmenuEntries: ContextMenu.Entry[] = [];
        if (hasFertilizer) {
          feedSubmenuEntries.push({
            title: 'Plantenvoeding',
            callbackURL: 'criminal/weed/feed',
            data: {
              plantId: this.id,
              objectId: this.object.id,
              itemName: 'farming_fertilizer',
            },
          });
        }

        if (hasDeluxeFertilizer) {
          feedSubmenuEntries.push({
            title: 'Deluxe Plantenvoeding',
            callbackURL: 'criminal/weed/feed',
            data: {
              plantId: this.id,
              objectId: this.object.id,
              itemName: 'farming_fertilizer_deluxe',
            },
          });
        }

        if (feedSubmenuEntries.length !== 0) {
          menuEntries.push({
            title: 'Voeding Geven',
            submenu: feedSubmenuEntries,
            icon: 'oil-can',
          });
        }
      }

      // If water not done and valid bucket in inventory, allow watering
      if (this.waterTime === 0) {
        const hasWaterBucket = plyItems.some(i => i.name === 'farming_bucket' && i.metadata.liter > 0);
        if (hasWaterBucket) {
          menuEntries.push({
            title: 'Water Geven',
            icon: 'droplet',
            callbackURL: 'criminal/weed/water',
            data: {
              plantId: this.id,
              objectId: this.object.id,
            },
          });
        }
      }
    }

    if (stage === 3) {
      menuEntries.push({
        title: 'Knippen',
        icon: 'scissors',
        callbackURL: 'criminal/weed/cut',
        data: {
          plantId: this.id,
          objectId: this.object.id,
        },
      });
    }

    UI.openContextMenu(plyId, menuEntries);
  };

  public feed = async (plyId: number, itemName: string) => {
    const itemState = await Inventory.getFirstItemOfNameOfPlayer(plyId, itemName);
    if (!itemState) return;

    const weedConfig = config.weed;
    const decrease = weedConfig.fertilizerDecrease;
    Inventory.setQualityOfItem(itemState.id, old => old - decrease);

    Notifications.add(plyId, 'Je hebt de plant gevoed', 'success');

    this.foodType = itemName === 'farming_fertilizer_deluxe' ? 'deluxe' : 'normal';
    SQL.query(`UPDATE weed_plants SET food_type = ? WHERE id = ?`, [this.foodType, this.id]);

    const logMessage = `${Util.getName(plyId)}(${plyId}) has fed a weed plant with ${itemName}`;
    this.logger.silly(logMessage);
    Util.Log('weed:feed', { plantId: this.id, itemName, ownerCid: this.cid }, logMessage, plyId);
  };

  public water = async (plyId: number) => {
    const cid = Util.getCID(plyId);
    const bucketItems = (await Inventory.getItemsWithNameInInventory('player', String(cid), 'farming_bucket')) ?? [];
    const bucketItem = bucketItems.find(i => i.metadata.liter > 0);
    if (!bucketItem) return;

    if (this.waterTime !== 0) {
      Notifications.add(plyId, 'Deze plant heeft al water gekregen', 'error');
      return;
    }

    Inventory.setMetadataOfItem(bucketItem.id, oldMetadata => ({
      liter: Number((oldMetadata.liter - 0.2).toFixed(1)),
    }));

    Notifications.add(plyId, 'Je hebt de plant water gegeven', 'success');
    this.waterTime = getCurrentSeconds() - this.plantTime;
    SQL.query(`UPDATE weed_plants SET water_time = ? WHERE id = ?`, [this.waterTime, this.id]);

    const logMessage = `${Util.getName(plyId)}(${plyId}) has watered a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:feed', { plantId: this.id, ownerCid: this.cid }, logMessage, plyId);
  };

  // destroy is for ply destroy action
  public destroy = (plyId: number) => {
    if (Jobs.getCurrentJob(plyId) !== 'police') return;

    this.remove();

    const logMessage = `${Util.getName(plyId)}(${plyId}) has destroyed a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:destroy', { plantId: this.id, ownerCid: this.cid }, logMessage, plyId);
  };

  public remove = () => {
    this.destroyObject();
    SQL.query('DELETE FROM weed_plants WHERE id = ?', [this.id]);
    weedPlantManager.unregisterWeedPlant(this.id);
  };

  public cut = (plyId: number) => {
    if (this.getStage() !== 3) return;

    const strain = this.calculateStrain();

    if (this.gender === 'male') {
      // for male, strain determines chance to get seed
      if (Util.getRndInteger(0, 101) <= strain) {
        Inventory.addItemToPlayer(plyId, 'weed_seed', 1);
      } else {
        Notifications.add(plyId, 'Te slechte kwaliteit...', 'error');
      }
    } else {
      // for female, strain determines amount of bags out of bud
      Inventory.addItemToPlayer(plyId, 'weed_bud', 1, { strain });
    }

    this.remove();

    const logMessage = `${Util.getName(plyId)}(${plyId}) has cut a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:cut', { plantId: this.id, ownerCid: this.cid }, logMessage, plyId);
  };

  public checkGrowth = async () => {
    const stage = this.getStage();
    if (stage === this.object?.stage) return;

    if (this.object != null) {
      await this.destroyObject();
    }

    this.spawnObject(stage);
  };

  /**
   * @returns stage 0: can feed, stage 1 | 2: growing, stage 3: can cut
   */
  public getStage = () => {
    const currentSeconds = getCurrentSeconds();
    if (currentSeconds < this.plantTime) throw new Error('plantTime is in the future');

    // check if still at feeding stage
    const maxFeedingTime = this.plantTime + config.weed.feedTime * 60;
    if (currentSeconds < maxFeedingTime) return 0;

    const timeGrown = currentSeconds - maxFeedingTime;
    const percentageGrown = (timeGrown / (config.weed.growTime * 60)) * 100;

    if (percentageGrown >= 100) return 3;
    return percentageGrown > 50 ? 2 : 1;
  };

  private calculateStrain = () => {
    if (this.waterTime === 0) return 0;

    const idealWaterTime = config.weed.idealWaterTime * 60;
    const maxDiffToIdeal = Math.max(idealWaterTime, config.weed.feedTime * 60 - idealWaterTime);
    const diffToIdeal = Math.abs(idealWaterTime - this.waterTime);
    const strain = 100 - (diffToIdeal / maxDiffToIdeal) * 100;
    const modifiedStrain = Math.round(strain * (config.weed.foodModifier[this.foodType] ?? 0));

    return Math.max(0, Math.min(100, modifiedStrain));
  };
}
