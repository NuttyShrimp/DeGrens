import { SQL, SyncedObjects, UI, Util, Inventory, Notifications, Phone, Jobs, Core } from '@dgx/server';
import { MODELS_PER_STAGE } from '../constants.weed';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { getCurrentSeconds } from '../service.weed';
import weedPlantManager from './weedplantmanager';

export class WeedPlant {
  private readonly id: number;
  private readonly coords: Vec3;
  private readonly rotation: Vec3;
  private objectId: string | null;
  private readonly gender: Criminal.Weed.Gender;
  public stage: Criminal.Weed.Stage;
  public food: number;
  private cutTime: number;
  public growTime: number;
  private cid: number;
  private timesCut: number;

  private logger: winston.Logger;

  constructor(
    id: number,
    coords: Vec3,
    rotation: Vec3,
    gender: Criminal.Weed.Gender,
    stage: Criminal.Weed.Stage,
    food: number,
    cutTime: number,
    growTime: number,
    cid: number,
    timesCut = 0
  ) {
    this.id = id;
    this.coords = coords;
    this.rotation = rotation;
    this.objectId = null;
    this.gender = gender;
    this.stage = stage;
    this.food = food;
    this.cutTime = cutTime;
    this.growTime = growTime;
    this.cid = cid;
    this.timesCut = timesCut;
    this.logger = mainLogger.child({ module: `WeedPlant #${this.id}` });

    this.spawnObject();
  }

  private spawnObject = async () => {
    await this.destroyObject();

    const [objectId] = await SyncedObjects.add({
      model: MODELS_PER_STAGE[this.stage],
      coords: this.coords,
      rotation: this.rotation,
      flags: {
        weedPlantId: this.id,
      },
      skipStore: true,
    });
    this.objectId = objectId;
  };

  private destroyObject = async () => {
    if (this.objectId == null) return;
    await SyncedObjects.remove(this.objectId);
    this.objectId = null;
  };

  private save = () => {
    SQL.query(`UPDATE weed_plants SET stage = ?, food = ?, grow_time = ?, cut_time = ?, times_cut = ? WHERE id = ?`, [
      this.stage,
      this.food,
      this.growTime,
      this.cutTime,
      this.timesCut,
      this.id,
    ]);
  };

  public view = async (plyId: number) => {
    const menuEntries: ContextMenu.Entry[] = [
      {
        title: `Gender: ${this.gender === 'male' ? 'Mannelijk' : 'Vrouwelijk'}`,
        disabled: true,
        icon: 'venus-mars',
      },
      {
        title: `Voedsel: ${this.food} percent`,
        disabled: true,
        icon: 'droplet-percent',
      },
      {
        title: 'Kapot Maken',
        icon: 'hammer-crash',
        callbackURL: 'criminal/weed/destroy',
        data: {
          plantId: this.id,
          objectId: this.objectId,
        },
      },
    ];

    if (this.canFeed()) {
      const plyItems = await Inventory.getPlayerItems(plyId);
      const hasFertilizer = plyItems.some(i => i.name === 'farming_fertilizer');
      const hasDeluxeFertilizer = plyItems.some(i => i.name === 'farming_fertilizer_deluxe');

      const feedSubmenuEntries: ContextMenu.Entry[] = [];
      if (hasFertilizer) {
        feedSubmenuEntries.push({
          title: 'Plantenvoeding',
          callbackURL: 'criminal/weed/feed',
          data: {
            plantId: this.id,
            objectId: this.objectId,
            deluxe: false,
          },
        });
      }

      if (hasDeluxeFertilizer) {
        feedSubmenuEntries.push({
          title: 'Deluxe Plantenvoeding',
          callbackURL: 'criminal/weed/feed',
          data: {
            plantId: this.id,
            objectId: this.objectId,
            deluxe: true,
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

    if (this.canCut()) {
      menuEntries.push({
        title: 'Knippen',
        icon: 'scissors',
        callbackURL: 'criminal/weed/cut',
        data: {
          plantId: this.id,
          objectId: this.objectId,
        },
      });
    }

    UI.openContextMenu(plyId, menuEntries);
  };

  private canFeed = () => {
    return this.food < 90;
  };

  public feed = async (plyId: number, deluxe: boolean) => {
    const itemName = deluxe ? 'farming_fertilizer_deluxe' : 'farming_fertilizer';
    const itemState = await Inventory.getFirstItemOfNameOfPlayer(plyId, itemName);
    if (!itemState) return;

    const weedConfig = config.weed;
    const decrease = weedConfig.fertilizerDecrease;
    Inventory.setQualityOfItem(itemState.id, old => old - decrease);

    Notifications.add(plyId, 'Je hebt de plant gevoed', 'success');

    const foodIncrease = deluxe ? weedConfig.food.amount.deluxe : weedConfig.food.amount.normal;
    this.food = Math.min(this.food + foodIncrease, 100);
    this.save();

    const logMessage = `${Util.getName(plyId)}(${plyId}) has fed a weed plant with ${
      deluxe ? 'normal' : 'deluxe'
    } fertilizer`;
    this.logger.silly(logMessage);
    Util.Log('weed:feed', { plantId: this.id, deluxe, ownerCid: this.cid }, logMessage, plyId);
  };

  // destroy is for ply destroy action
  public destroy = (plyId: number) => {
    this.destroyObject();
    SQL.query('DELETE FROM weed_plants WHERE id = ?', [this.id]);
    weedPlantManager.unregisterWeedPlant(this.id);

    const logMessage = `${Util.getName(plyId)}(${plyId}) has destroyed a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:destroy', { plantId: this.id, ownerCid: this.cid }, logMessage, plyId);

    if (
      this.cid &&
      Util.getRndInteger(0, 101) < config.weed.destroyMailChance &&
      Jobs.getCurrentJob(plyId) !== 'police'
    ) {
      const charInfo = Core.getPlayer(plyId)?.charinfo;
      const charName = `${charInfo?.firstname ?? 'Onbekende'} ${charInfo?.lastname ?? 'Persoon'}`;

      Phone.sendOfflineMail(
        this.cid,
        'Plant Informatie',
        'Walter Green',
        `Een contact van mij wist te vertellen dat hij '${charName}' je plant heeft zien kapotmaken.`
      );
    }
  };

  // remove is for scriptwise deleting plant
  public remove = () => {
    this.destroyObject();
    SQL.query('DELETE FROM weed_plants WHERE id = ?', [this.id]);
    weedPlantManager.unregisterWeedPlant(this.id);

    const logMessage = `weed plant ${this.id} has been removed`;
    this.logger.silly(logMessage);
    Util.Log('weed:remove', { plantId: this.id, ownerCid: this.cid }, logMessage);
  };

  public canCut = () => {
    if (!this.isFullyGrown()) return false;
    if (this.food < 90) return false;

    const currentTime = getCurrentSeconds();
    return currentTime >= this.cutTime + config.weed.cut.timeout * 60 * 60; // config value is in hours
  };

  public cut = (plyId: number) => {
    if (!this.canCut()) return;

    const item = this.gender === 'male' ? 'weed_seed' : 'weed_bud';
    Inventory.addItemToPlayer(plyId, item, 1);
    this.cutTime = getCurrentSeconds();
    this.timesCut++;

    const logMessage = `${Util.getName(plyId)}(${plyId}) has cut a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:cut', { plantId: this.id, ownerCid: this.cid }, logMessage, plyId);

    const removePlant =
      this.timesCut > config.weed.cut.maxTimes || Util.getRndInteger(1, 101) <= config.weed.cut.breakChance;
    if (removePlant) {
      this.remove();
      Notifications.add(plyId, 'De plant is gestorven', 'error');
    } else {
      this.save();
    }
  };

  public grow = (currentSeconds: number) => {
    this.stage = Math.min(3, this.stage + 1) as Criminal.Weed.Stage;
    this.growTime = currentSeconds;
    this.save();
    this.spawnObject();
  };

  public depleteFood = () => {
    this.food--;
    if (this.food <= 0) {
      this.remove();
    }
  };

  public isFullyGrown = () => {
    return this.stage === 3;
  };
}
