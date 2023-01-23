import { Events, Inventory, Notifications, SQL, Util } from '@dgx/server';
import { getConfig } from 'services/config';
import { weedLogger } from './logger.weed';

const plants = new Map<number, Criminal.Weed.Plant>();
let plantsLoaded = false;

export const awaitPlantsLoaded = () => Util.awaitCondition(() => plantsLoaded);
export const getClientPlants = () => {
  const clientVersion: Record<number, Criminal.Weed.Plant> = {};
  plants.forEach((data, id) => {
    clientVersion[id] = data;
  });
  return clientVersion;
};

export const seedExistingPlantsForClient = async (plyId: number) => {
  await awaitPlantsLoaded();
  Events.emitNet('criminal:weed:seedExistingPlants', plyId, getClientPlants());
};

export const fetchAllPlants = async () => {
  const result: Criminal.Weed.DBPlant[] = await SQL.query('SELECT * FROM weed_plants');
  if (!result) return;

  for (const plantData of result) {
    const coords: Vec3 = JSON.parse(plantData.coords);
    plants.set(plantData.id, {
      coords,
      gender: plantData.gender,
      metadata: {
        stage: plantData.stage,
        food: plantData.food,
        cutTime: plantData.cut_time,
        growTime: plantData.grow_time,
      },
    });
  }
  plantsLoaded = true;
};

export const addNewPlant = async (plyId: number, coords: Vec3, gender: Criminal.Weed.Gender) => {
  const currentTime = Math.round(Date.now() / 1000);
  const result: Omit<Criminal.Weed.DBPlant, 'coords' | 'gender'>[] = await SQL.query(
    `INSERT INTO weed_plants (coords, gender, grow_time, cut_time)
                                  VALUES (?, ?, ?, ?) 
                                  RETURNING id, stage, food, grow_time, cut_time`,
    [JSON.stringify(coords), gender, currentTime, currentTime]
  );

  const data = result?.[0];
  if (!data) {
    weedLogger.error('Failed to insert new plant data');
    return;
  }

  const plant = {
    coords,
    gender,
    metadata: {
      stage: data.stage,
      food: data.food,
      growTime: data.grow_time,
      cutTime: data.cut_time,
    },
  };
  plants.set(data.id, plant);
  Events.emitNet('criminal:weed:register', -1, data.id, plant);

  weedLogger.silly(`Player ${plyId} has planted a weed plant`);
  Util.Log('weed:planted', { ...plant }, `${Util.getName(plyId)} has planted a weed plant`, plyId);
};

export const feedPlant = (plyId: number, id: number) => {
  const data = plants.get(id);
  if (!data) return;
  data.metadata.food = Math.min(data.metadata.food + getConfig().weed.food.amount, 100);
  Events.emitNet('criminal:weed:updatePlant', -1, id, data.metadata);
  savePlant(id);

  weedLogger.silly(`Player ${plyId} has fed a weed plant`);
  Util.Log('weed:feed', { plantId: id }, `${Util.getName(plyId)} has fed a weed plant`, plyId);
};

export const removePlant = (id: number) => {
  plants.delete(id);
  SQL.query('DELETE FROM weed_plants WHERE id = ?', [id]);
  Events.emitNet('criminal:weed:remove', -1, id);
};

export const canCutPlant = (id: number) => {
  const data = plants.get(id);
  if (!data) return false;
  const currentTime = Math.round(Date.now() / 1000);
  return currentTime >= data.metadata.cutTime + getConfig().weed.cut.timeout * 60 * 60;
};

export const cutPlant = (plyId: number, id: number) => {
  const data = plants.get(id);
  if (!data) return;

  const item = data.gender === 'male' ? 'weed_seed' : 'weed_bud';
  Inventory.addItemToPlayer(plyId, item, 1);
  data.metadata.cutTime = Math.round(Date.now() / 1000);
  Events.emitNet('criminal:weed:updatePlant', -1, id, data.metadata);
  savePlant(id);

  weedLogger.silly(`Player ${plyId} has cut a weed plant`);
  Util.Log('weed:cut', { plantId: id }, `${Util.getName(plyId)} has cut a weed plant`, plyId);

  setTimeout(() => {
    const rnd = Util.getRndInteger(1, 101);
    if (rnd > getConfig().weed.cut.breakChance) return;
    removePlant(id);
    Notifications.add(plyId, 'De plant is gestorven', 'error');
  }, 1000);
};

export const startWeedThreads = () => {
  // Growing loop
  const growTime = getConfig().weed.growTime * 60 * 60;
  setInterval(() => {
    weedLogger.silly('Plant grow interval fired');
    const currentTime = Math.round(Date.now() / 1000);
    plants.forEach((p, id) => {
      if (p.metadata.stage < 4 && currentTime >= p.metadata.growTime + growTime) {
        p.metadata.stage++;
        p.metadata.growTime = currentTime;
        Events.emitNet('criminal:weed:updatePlant', -1, id, p.metadata);
        savePlant(id);
      }
    });
  }, 10 * 60 * 1000);

  // Food depletion loop
  setInterval(() => {
    weedLogger.silly('Plant food depletion interval fired');
    const idsToRemove: number[] = [];
    plants.forEach((p, id) => {
      p.metadata.food--;
      if (p.metadata.food <= 0) {
        idsToRemove.push(id);
      }
    });
    idsToRemove.forEach(id => {
      removePlant(id);
    });
    setTimeout(() => {
      SQL.query('UPDATE weed_plants SET food = food - 1');
      Events.emitNet('criminal:weed:depleteFood', -1);
    }, 5000);
  }, getConfig().weed.food.decayTime * 60 * 1000);
};

export const savePlant = (id: number) => {
  const data = plants.get(id);
  if (!data) return;
  SQL.query(`UPDATE weed_plants SET stage = ?, food = ?, grow_time = ?, cut_time = ? WHERE id = ?`, [
    data.metadata.stage,
    data.metadata.food,
    data.metadata.growTime,
    data.metadata.cutTime,
    id,
  ]);
};
