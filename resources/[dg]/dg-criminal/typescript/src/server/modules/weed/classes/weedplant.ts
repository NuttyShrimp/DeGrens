import { SQL, StaticObjects, UI, Util, Inventory, Notifications } from '@dgx/server';
import { MODELS_PER_STAGE } from '../constants.weed';
import { getConfig } from 'services/config';
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

  private logger: winston.Logger;

  constructor(
    id: number,
    coords: Vec3,
    rotation: Vec3,
    gender: Criminal.Weed.Gender,
    stage: Criminal.Weed.Stage,
    food: number,
    cutTime: number,
    growTime: number
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
    this.logger = mainLogger.child({ module: `WeedPlant #${this.id}` });

    this.spawnObject();
  }

  private spawnObject = () => {
    this.destroyObject();

    const [objectId] = StaticObjects.add({
      model: MODELS_PER_STAGE[this.stage],
      coords: this.coords,
      rotation: this.rotation,
      flags: {
        weedPlantId: this.id,
      },
    });
    this.objectId = objectId;
  };

  private destroyObject = () => {
    if (this.objectId == null) return;
    StaticObjects.remove(this.objectId);
    this.objectId = null;
  };

  private save = () => {
    SQL.query(`UPDATE weed_plants SET stage = ?, food = ?, grow_time = ?, cut_time = ? WHERE id = ?`, [
      this.stage,
      this.food,
      this.growTime,
      this.cutTime,
      this.id,
    ]);
  };

  public view = async (plyId: number) => {
    const hasFertilizer = await Inventory.doesPlayerHaveItems(plyId, 'farming_fertilizer');

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

    if (hasFertilizer && this.canFeed()) {
      menuEntries.push({
        title: 'Voeden',
        icon: 'oil-can',
        callbackURL: 'criminal/weed/feed',
        data: {
          plantId: this.id,
          objectId: this.objectId,
        },
      });
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

  public feed = async (plyId: number) => {
    const removed = await Inventory.removeItemByNameFromPlayer(plyId, 'farming_fertilizer');
    if (!removed) {
      Notifications.add(plyId, 'Je hebt geen voeding', 'error');
      return;
    }

    Notifications.add(plyId, 'Je hebt de plant gevoed', 'success');

    this.food = Math.min(this.food + getConfig().weed.food.amount, 100);
    this.save();

    const logMessage = `${Util.getName(plyId)}${plyId} has fed a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:feed', { plantId: this.id }, logMessage, plyId);
  };

  // destroy is for ply destroy action
  public destroy = (plyId: number) => {
    this.destroyObject();
    SQL.query('DELETE FROM weed_plants WHERE id = ?', [this.id]);
    weedPlantManager.unregisterWeedPlant(this.id);

    const logMessage = `${Util.getName(plyId)}(${plyId}) has destroyed a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:destroy', { plantId: this.id }, logMessage, plyId);
  };

  // remove is for scriptwise deleting plant
  public remove = () => {
    this.destroyObject();
    SQL.query('DELETE FROM weed_plants WHERE id = ?', [this.id]);
    weedPlantManager.unregisterWeedPlant(this.id);

    const logMessage = `weed plant ${this.id} has been removed`;
    this.logger.silly(logMessage);
    Util.Log('weed:remove', { plantId: this.id }, logMessage);
  };

  public canCut = () => {
    if (!this.isFullyGrown()) return false;
    const currentTime = getCurrentSeconds();
    return currentTime >= this.cutTime + getConfig().weed.cut.timeout * 60 * 60; // config value is in hours
  };

  public cut = (plyId: number) => {
    if (!this.canCut()) return;

    const item = this.gender === 'male' ? 'weed_seed' : 'weed_bud';
    Inventory.addItemToPlayer(plyId, item, 1);
    this.cutTime = getCurrentSeconds();
    this.save();

    // Chance of breaking when cutting
    setTimeout(() => {
      const rnd = Util.getRndInteger(1, 101);
      if (rnd > getConfig().weed.cut.breakChance) return;
      this.remove();
      Notifications.add(plyId, 'De plant is gestorven', 'error');
    }, 1000);

    const logMessage = `${Util.getName(plyId)}(${plyId}) has cut a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:cut', { plantId: this.id }, logMessage, plyId);
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
