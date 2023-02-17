import { Inventory, StaticObjects } from '@dgx/server';
import { getCurrentSeconds } from 'helpers';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

export class Plant {
  private readonly _id: number;
  private readonly _seed: string;
  private readonly coords: Vec3;
  private readonly plantTime: number;
  private objectId!: string;
  private logger: winston.Logger;
  private readonly actions: Farming.Actions;

  constructor(id: number, seed: string, coords: Vec3) {
    this._id = id;
    this._seed = seed;
    this.coords = coords;
    this.plantTime = getCurrentSeconds();
    this.logger = mainLogger.child({ module: `Plant #${this.id}` });
    this.actions = {
      cut: null,
      feed: null,
      feedDeluxe: null,
      water: null,
    };

    const { model, zOffset } = config.defaultPlant;
    this.spawn(model, zOffset);

    const seedConfig = config.seeds[seed];
    setTimeout(() => {
      StaticObjects.remove(this.objectId);
      this.spawn(seedConfig.model, seedConfig.zOffset);
    }, seedConfig.growTime * 60 * 1000);

    this.logger.silly(`Plant ${this.seed} has been created`);
  }

  public get id() {
    return this._id;
  }
  public get seed() {
    return this._seed;
  }

  private spawn = (model: string, zOffset: number) => {
    const [objectId] = StaticObjects.add({
      model,
      coords: {
        ...this.coords,
        z: this.coords.z + zOffset,
      },
      flags: {
        farmingPlantId: this.id,
      },
    });
    this.objectId = objectId;
  };

  public setAction = (action: Farming.ActionType) => {
    this.actions[action] = getCurrentSeconds();
  };

  public harvest = (plyId: number) => {
    if (!this.canHarvest()) return;

    StaticObjects.remove(this.objectId);
    const quality = this.calculateQuality();
    Inventory.addItemToPlayer(plyId, config.seeds[this.seed].product, 1, {
      quality,
    });
  };

  public getGrowthPercentage = () => {
    const currentSeconds = getCurrentSeconds();
    const totalSeconds = config.seeds[this.seed].growTime * 60;
    const percentage = (currentSeconds - this.plantTime) / totalSeconds;
    return Math.min(100, Math.round(percentage * 100));
  };

  public canHarvest = () => {
    return this.getGrowthPercentage() === 100;
  };

  private calculateQuality = () => {
    // We have 4 different actions. 3 need to be done per seed
    // We start on 25 quality because we start with assuming player did not do 4th action
    let quality = 25;

    const seedConfig = config.seeds[this.seed];
    for (const [action, time] of Object.entries(this.actions)) {
      if (time === null) continue;

      const target = seedConfig.actions[action as Farming.ActionType];
      if (!target) {
        quality -= 25;
        continue;
      }

      const actionTime = time - this.plantTime;
      const targetTime = target * 60;
      const totalTime = seedConfig.growTime * 60;

      const maxDiff = Math.max(targetTime, totalTime - targetTime);
      const diff = Math.abs(targetTime - actionTime);
      const correctness = 1 - diff / maxDiff;
      quality += correctness * 25;
    }

    return Math.round(quality);
  };

  public hasActionBeenDone = (action: Farming.ActionType) => {
    return this.actions[action] !== null;
  };
}
