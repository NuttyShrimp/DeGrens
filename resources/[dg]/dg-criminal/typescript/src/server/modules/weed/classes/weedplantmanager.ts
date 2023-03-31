import { SQL, Util } from '@dgx/server';
import { DGXEvent, EventListener } from '@dgx/server/decorators';
import { WeedPlant } from './weedplant';
import winston from 'winston';
import { mainLogger } from 'sv_logger';
import { getCurrentSeconds } from '../service.weed';
import config from 'services/config';

@EventListener()
class WeedPlantManager extends Util.Singleton<WeedPlantManager>() {
  private readonly weedPlants: Map<number, WeedPlant>;
  private logger: winston.Logger;

  constructor() {
    super();
    this.weedPlants = new Map();
    this.logger = mainLogger.child({ module: 'WeedPlantManager' });
  }

  public fetchAll = async () => {
    const result: Criminal.Weed.DBPlant[] = await SQL.query('SELECT * FROM weed_plants');
    if (!result) return;

    for (const plantData of result) {
      const coords: Vec3 = JSON.parse(plantData.coords);
      const rotation: Vec3 = JSON.parse(plantData.rotation);
      const newWeedPlant = new WeedPlant(
        plantData.id,
        coords,
        rotation,
        plantData.gender,
        plantData.stage,
        plantData.food,
        plantData.cut_time,
        plantData.grow_time,
        plantData.cid ?? 0,
        plantData.times_cut ?? 0
      );
      this.weedPlants.set(plantData.id, newWeedPlant);
    }
  };

  public addNew = async (plyId: number, coords: Vec3, rotation: Vec3, gender: Criminal.Weed.Gender) => {
    const cid = Util.getCID(plyId);
    const currentTime = Math.round(Date.now() / 1000);
    const result: Omit<Criminal.Weed.DBPlant, 'coords' | 'rotation' | 'gender'>[] = await SQL.query(
      `INSERT INTO weed_plants (coords, rotation, gender, grow_time, cut_time, cid)
                                    VALUES (?, ?, ?, ?, ?, ?) 
                                    RETURNING id, stage, food, grow_time, cut_time`,
      [JSON.stringify(coords), JSON.stringify(rotation), gender, currentTime, currentTime, cid]
    );

    const data = result?.[0];
    if (!data) {
      this.logger.error('Failed to insert new plant data');
      return;
    }

    const newWeedPlant = new WeedPlant(
      data.id,
      coords,
      rotation,
      gender,
      data.stage,
      data.food,
      data.cut_time,
      data.grow_time,
      cid
    );
    this.weedPlants.set(data.id, newWeedPlant);

    const logMessage = `${Util.getName(plyId)}(${plyId}) has planted a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:planted', { gender, coords, rotation, plantId: data.id, ownerCid: cid }, logMessage, plyId);
  };

  @DGXEvent('criminal:weed:viewPlant')
  private _viewWeedPlant = (plyId: number, weedPlantId: number) => {
    const weedPlant = this.weedPlants.get(weedPlantId);
    if (!weedPlant) return;
    weedPlant.view(plyId);
  };

  @DGXEvent('criminal:weed:feed')
  private _feedWeedPlant = (plyId: number, weedPlantId: number, deluxe: boolean) => {
    const weedPlant = this.weedPlants.get(weedPlantId);
    if (!weedPlant) return;
    weedPlant.feed(plyId, deluxe);
  };

  @DGXEvent('criminal:weed:destroy')
  private _destroyWeedPlant = (plyId: number, weedPlantId: number) => {
    const weedPlant = this.weedPlants.get(weedPlantId);
    if (!weedPlant) return;
    weedPlant.destroy(plyId);
  };

  @DGXEvent('criminal:weed:cut')
  private _cutWeedPlant = (plyId: number, weedPlantId: number) => {
    const weedPlant = this.weedPlants.get(weedPlantId);
    if (!weedPlant) return;
    weedPlant.cut(plyId);
  };

  public unregisterWeedPlant = (weedPlantId: number) => {
    this.weedPlants.delete(weedPlantId);
  };

  public startThreads = () => {
    // Growing loop
    const growTime = config.weed.growTime * 60 * 60;
    setInterval(() => {
      this.logger.silly('Plant grow interval fired');

      const currentSeconds = getCurrentSeconds();
      for (const weedPlant of this.weedPlants.values()) {
        if (weedPlant.isFullyGrown()) continue;
        if (currentSeconds < weedPlant.growTime + growTime) continue;
        weedPlant.grow(currentSeconds);
      }
    }, 10 * 60 * 1000);

    // Food depletion loop
    setInterval(() => {
      this.logger.silly('Plant food depletion interval fired');

      for (const weedPlant of this.weedPlants.values()) {
        weedPlant.depleteFood();
      }

      // save food after timeout, to ensure removed plants are already removed
      setTimeout(() => {
        SQL.query('UPDATE weed_plants SET food = food - 1');
      }, 5000);
    }, config.weed.food.decayTime * 60 * 1000);
  };
}

const weedPlantManager = WeedPlantManager.getInstance();
export default weedPlantManager;
