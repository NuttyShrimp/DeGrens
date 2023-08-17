import { SQL, Util } from '@dgx/server';
import { DGXEvent, EventListener } from '@dgx/server/src/decorators';
import { WeedPlant } from './weedplant';
import winston from 'winston';
import { mainLogger } from 'sv_logger';
import { getCurrentSeconds } from '../service.weed';

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
    // This is purely to migrate old data to the new system, we set food and water to avoid people receiving nothing
    await SQL.query(
      `UPDATE weed_plants SET plant_time = ?, food_type = 'deluxe', water_time = 1290 WHERE plant_time = 0`,
      [getCurrentSeconds()]
    );

    const result: Criminal.Weed.DBPlant[] = await SQL.query('SELECT * FROM weed_plants');
    if (!result) return;

    const currentSeconds = getCurrentSeconds();
    const idsToDelete: number[] = [];

    for (const plantData of result) {
      // if plant has existed more than 7 days, destroy
      if (plantData.plant_time + 7 * 24 * 60 * 60 < currentSeconds) {
        idsToDelete.push(plantData.id);
        continue;
      }

      const coords: Vec3 = JSON.parse(plantData.coords);
      const rotation: Vec3 = JSON.parse(plantData.rotation);
      const newWeedPlant = new WeedPlant(
        plantData.id,
        coords,
        rotation,
        plantData.gender,
        plantData.plant_time,
        plantData.cid ?? 0,
        plantData.food_type,
        plantData.water_time
      );
      this.weedPlants.set(plantData.id, newWeedPlant);
    }

    if (idsToDelete.length > 0) {
      await SQL.query(`DELETE FROM weed_plants WHERE id IN (${idsToDelete.join(', ')})`);
    }
  };

  public addNew = async (plyId: number, coords: Vec3, rotation: Vec3, gender: Criminal.Weed.Gender) => {
    const cid = Util.getCID(plyId);
    const currentTime = getCurrentSeconds();

    // foodtype & watertime get handled by defaults
    const result = await SQL.query<Pick<Criminal.Weed.DBPlant, 'id'>[]>(
      `INSERT INTO weed_plants (coords, rotation, gender, plant_time, cid) VALUES (?, ?, ?, ?, ?) RETURNING id`,
      [JSON.stringify(coords), JSON.stringify(rotation), gender, currentTime, cid]
    );

    const plantId = result?.[0]?.id;
    if (!plantId) {
      this.logger.error('Failed to insert new plant data');
      return;
    }

    const newWeedPlant = new WeedPlant(plantId, coords, rotation, gender, currentTime, cid);
    this.weedPlants.set(plantId, newWeedPlant);

    const logMessage = `${Util.getName(plyId)}(${plyId}) has planted a weed plant`;
    this.logger.silly(logMessage);
    Util.Log('weed:planted', { gender, coords, rotation, plantId, ownerCid: cid }, logMessage, plyId);
  };

  @DGXEvent('criminal:weed:viewPlant')
  private _viewWeedPlant = (plyId: number, weedPlantId: number) => {
    const weedPlant = this.weedPlants.get(weedPlantId);
    if (!weedPlant) return;
    weedPlant.view(plyId);
  };

  @DGXEvent('criminal:weed:feed')
  private _feedWeedPlant = (plyId: number, weedPlantId: number, itemName: string) => {
    const weedPlant = this.weedPlants.get(weedPlantId);
    if (!weedPlant) return;
    weedPlant.feed(plyId, itemName);
  };

  @DGXEvent('criminal:weed:water')
  private _waterWeedPlant = (plyId: number, weedPlantId: number) => {
    const weedPlant = this.weedPlants.get(weedPlantId);
    if (!weedPlant) return;
    weedPlant.water(plyId);
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
    setInterval(
      () => {
        this.logger.silly('Plant grow interval fired');

        for (const [_, weedPlant] of this.weedPlants) {
          weedPlant.checkGrowth();
        }
      },
      10 * 60 * 1000
    );
  };
}

const weedPlantManager = WeedPlantManager.getInstance();
export default weedPlantManager;
