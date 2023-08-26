import { Config, Events, Notifications, Util, Inventory, Financials } from '@dgx/server';
import jobManager from 'classes/jobManager';
import { changeJobOfPlayerGroup } from 'modules/groups/service';
import { huntingLogger } from './logger.hunting';

let huntingConfig: Hunting.Config;
// plyid to data
const activePlayers = new Set<number>();

// This job is solo as theres no benefit of doing with more players
// we only use groups for consistency & to be able to properly stop job when player leaves group
export const initializeHunting = () => {
  huntingConfig = Config.getConfigValue('jobs.hunting');

  jobManager.registerJob('hunting', {
    title: 'Jagen',
    size: 1,
    legal: true,
    icon: 'deer',
    location: { x: -696.0436, y: 5802.522 },
  });

  // Register sell stash
  const items = Object.keys(huntingConfig.sellables);
  Inventory.createScriptedStash('hunting_sell', 5, items);
};

export const startHuntingJobForPlayer = (plyId: number) => {
  const jobAssigned = changeJobOfPlayerGroup(plyId, 'hunting');
  if (!jobAssigned) return;

  activePlayers.add(plyId);
  Events.emitNet('jobs:hunting:start', plyId, huntingConfig.huntingZones);

  const plySteamName = Util.getName(plyId);
  huntingLogger.silly(`${plySteamName}(${plyId}) started hunting job`);
  Util.Log('jobs:hunting:start', {}, `${plySteamName}(${plyId}) started hunting job`, plyId);
};

export const finishHuntingJobForPlayer = (plyId: number | null) => {
  if (!plyId) return;
  if (!activePlayers.has(plyId)) return;

  activePlayers.delete(plyId);
  const plySteamName = Util.getName(plyId);
  if (plySteamName) {
    Events.emitNet('jobs:hunting:cleanup', plyId);
  }

  huntingLogger.silly(`${plySteamName}(${plyId}) finished hunting job`);
  Util.Log('jobs:hunting:stop', {}, `${plySteamName}(${plyId}) stopped hunting job`, plyId);
};

export const tryToPlaceBait = (plyId: number, itemId: string) => {
  if (!activePlayers.has(plyId)) {
    Notifications.add(plyId, 'Je bent momenteel niet aan het jagen', 'error');
    return;
  }

  // select animalmodel
  let animalModel: string | undefined = undefined;
  let rng = Util.getRndInteger(1, 101);
  for (const animal of huntingConfig.animals) {
    if (rng > animal.chance) {
      rng -= animal.chance;
      continue;
    }

    animalModel = animal.model;
    break;
  }
  if (!animalModel) return;

  Events.emitNet('jobs:hunting:placeBait', plyId, itemId, animalModel);
  Util.Log(
    'jobs:hunting:placedBait',
    { animalModel },
    `${Util.getName(plyId)}(${plyId}) has placed animal bait`,
    plyId
  );
};

export const lootAnimal = (plyId: number, animalNetId: number) => {
  if (!activePlayers.has(plyId)) return;

  const animal = NetworkGetEntityFromNetworkId(animalNetId);
  if (!animal || !DoesEntityExist(animal)) return;

  const fromBait = Entity(animal).state?.fromBait ?? false;

  const animalHash = GetEntityModel(animal) >>> 0;
  const animalConfig = huntingConfig.animals.find(a => GetHashKey(a.model) >>> 0 === animalHash);
  if (!animalConfig) return;

  if (animalHash === GetHashKey(animalConfig.model) >>> 0) {
    DeleteEntity(animal);
  } else {
    huntingLogger.error('Animal entity was not of correct model so did not delete');
  }

  const chance = animalConfig.meatChance * 100;
  if (Util.getRndInteger(1, 101) < chance) {
    Inventory.addItemToPlayer(plyId, 'animal_meat', 1);
  }

  Inventory.addItemToPlayer(plyId, animalConfig.item, 1, {
    hiddenKeys: ['fromBait'],
    fromBait,
  });

  Util.Log('jobs:hunting:lootAnimal', {}, `${Util.getName(plyId)}(${plyId}) has skinned an animal`, plyId);
};

export const sellItem = (plyId: number, itemState: Inventory.ItemState<{ fromBait: boolean }>) => {
  if (!(itemState.name in huntingConfig.sellables)) {
    huntingLogger.error('Tried to sell item that was not a sellable');
    return;
  }

  const fromBait = itemState.metadata?.fromBait ?? false;

  setTimeout(async () => {
    const removed = await Inventory.removeItemByIdFromInventory('stash', 'hunting_sell', itemState.id);
    if (!removed) return; // item got removed manually during timeout
    const price = huntingConfig.sellables[itemState.name];
    const multiplier = fromBait ? 1 : huntingConfig.freeroamPercentage;
    Financials.addCash(plyId, price * multiplier, 'hunting_sell');
  }, 5000);
};
