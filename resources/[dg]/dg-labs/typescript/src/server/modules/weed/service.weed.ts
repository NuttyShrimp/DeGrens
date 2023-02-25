import { Util, Inventory, Notifications } from '@dgx/server';
import { weedLogger } from './logger.weed';
import config from 'services/config';

const plants: Labs.Weed.Plants = [];
const harvestPlayers = new Set<number>();

export const loadDefaultWeedPlantsState = () => {
  const amountOfPlants = config.interiors.weed.peekZones.reduce(
    (acc, cur) => acc + (cur.action === 'plant' ? 1 : 0),
    0
  );

  for (let i = 0; i < amountOfPlants; i++) {
    plants.push({
      canHarvest: false,
      canFertilize: true,
    });
  }
};

export const canFertilizePlant = (plantId: number) => {
  return plants[plantId]?.canFertilize ?? false;
};

export const fertilizePlant = (plyId: number, plantId: number) => {
  const plant = plants[plantId];
  if (!plant) return;
  if (!plant.canFertilize) return;

  plant.canFertilize = false;
  setTimeout(() => {
    plant.canHarvest = true;
  }, config.weed.harvestDelay * 60 * 1000);

  const logMsg = `${Util.getName(plyId)}(${plyId}) has fertilized plant ${plantId}`;
  weedLogger.debug(logMsg);
  Util.Log('labs:weed:fertilize', { plantId }, logMsg, plyId);
};

export const canHarvestPlant = (plantId: number) => {
  return plants[plantId]?.canHarvest ?? false;
};

export const harvestPlant = (plyId: number, plantId: number) => {
  const plant = plants[plantId];
  if (!plant) return;
  if (!plant.canHarvest) return;

  plant.canHarvest = false;
  harvestPlayers.add(plyId);
  setTimeout(() => {
    plant.canFertilize = true;
  }, config.weed.timeout * 60 * 1000);

  Util.changePlayerStress(plyId, 5);

  const logMsg = `${Util.getName(plyId)}(${plyId}) has harvested plant ${plantId}`;
  weedLogger.debug(logMsg);
  Util.Log('labs:weed:harvest', { plantId }, logMsg, plyId);
};

export const canSearchHarvestedPlant = (plyId: number) => {
  return harvestPlayers.has(plyId);
};

export const searchHarvestedPlant = (plyId: number) => {
  const didHarvest = harvestPlayers.delete(plyId);
  if (!didHarvest) {
    Notifications.add(plyId, 'Je hebt nog geen planten geknipt', 'error');
    return;
  }

  const rng = Util.getRndInteger(1, 101);
  if (rng > config.weed.rewardChance) {
    Notifications.add(plyId, 'Er zat niks bruikbaar tussen', 'error');
    return;
  }

  const item = config.weed.rewards[Math.floor(Math.random() * config.weed.rewards.length)];
  Inventory.addItemToPlayer(plyId, item, 1);

  const logMsg = `${Util.getName(plyId)}(${plyId}) has searched from harvest`;
  weedLogger.debug(logMsg);
  Util.Log('labs:weed:search', {}, logMsg, plyId);
};
