import { Reputations, Util, Inventory, SQL } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import { getConfig } from './config';

const craftingLogger = mainLogger.child({ module: 'Crafting' });

const benches = new Map<string, Materials.Crafting.Bench.Data>();
const recipes = new Map<string, Materials.Crafting.Recipes.Recipe>();

export const loadCrafting = async () => {
  await Inventory.awaitLoad();

  // Build the required UI data for each recipe so we can cache it
  const configRecipes = Object.entries(getConfig().crafting.recipes);
  configRecipes.forEach(([itemName, recipe]) => {
    const info = Inventory.getItemData(itemName);
    if (!info) return;
    const requirements = recipe.items.map(r => {
      const reqInfo = Inventory.getItemData(r.name);
      return { ...r, label: reqInfo?.label ?? 'Undefined' };
    });
    const UIData: Materials.Crafting.Recipes.RecipeItem = {
      name: itemName,
      label: info.label,
      image: info.image,
      size: info.size,
      amount: 100,
      requirements: { items: requirements },
    };
    recipes.set(itemName, { requiredReputation: recipe.requiredReputation, UIData });
  });

  // Load benches
  const dbLevels: { benchId: string; level: number }[] = await SQL.query(`SELECT * FROM bench_levels`);
  Object.entries(getConfig().crafting.benches).forEach(([benchId, benchConfig]) => {
    let data: Materials.Crafting.Bench.Data;
    if (benchConfig.reputation === undefined) {
      let level = dbLevels.find(x => x.benchId === benchId)?.level;
      if (level === undefined) {
        updateBenchLevel(benchId, 0);
        level = 0;
      }
      data = { id: benchId, items: benchConfig.items, level };
    } else {
      data = { id: benchId, items: benchConfig.items, reputation: benchConfig.reputation };
    }
    benches.set(benchId, data);
  });

  craftingLogger.silly('All benches and recipes have been loaded');
};

const getBenchById = (benchId: string) => {
  const bench = benches.get(benchId);
  if (bench === undefined) {
    craftingLogger.warn(`Tried to get bench with invalid id ${benchId}`);
    Util.Log(
      'materials:crafting:invalidBench',
      { benchId },
      `Tried to get bench with invalid id ${benchId}`,
      undefined,
      true
    );
    return;
  }
  return bench;
};

// Logging for undefined happens in rep modules
const getReputationForBench = (bench: Materials.Crafting.Bench.Data, plyId: number): number | undefined => {
  if ('reputation' in bench) {
    const cid = Util.getCID(plyId);
    return Reputations.getReputation(cid, bench.reputation);
  }

  return bench.level;
};

const increaseReputationForBench = (bench: Materials.Crafting.Bench.Data, plyId: number) => {
  if ('reputation' in bench) {
    const cid = Util.getCID(plyId);
    Reputations.setReputation(cid, bench.reputation, rep => rep + 1);
    return;
  }

  const newLevel = bench.level + 1;
  benches.set(bench.id, { ...bench, level: newLevel });
  updateBenchLevel(bench.id, newLevel);
  craftingLogger.silly(`Level increased for bench ${bench.id}`);
};

global.exports('getBenchItems', (plyId: number, benchId: string) => {
  const bench = getBenchById(benchId);
  if (!bench) return;

  const reputation = getReputationForBench(bench, plyId);
  if (reputation === undefined) return; // logging happens in rep module

  const benchItems = Array.from(recipes.values()).filter(
    i => bench.items.includes(i.UIData.name) && i.requiredReputation <= reputation
  );

  return benchItems.map(i => i.UIData);
});

global.exports('getItemRecipe', (plyId: number, benchId: string, itemName: string) => {
  const bench = getBenchById(benchId);
  if (!bench) return;

  const item = recipes.get(itemName);
  if (!item) return;

  const reputation = getReputationForBench(bench, plyId);
  if (reputation === undefined) return;
  if (item.requiredReputation > reputation) return;

  return item.UIData;
});

on('inventory:craftedInBench', (plyId: number, benchId: string, item: Inventory.ItemState) => {
  const bench = getBenchById(benchId);
  if (!bench) return;
  increaseReputationForBench(bench, plyId);
  Util.Log(
    'materials:crafting:crafted',
    { benchId, item },
    `${Util.getName(plyId)} has crafted ${item.name} in bench ${benchId}`,
    plyId
  );
});

const updateBenchLevel = async (benchId: string, level: number) => {
  const query = `INSERT INTO bench_levels (benchId, level) VALUES (?, ?) ON DUPLICATE KEY UPDATE level = VALUES(level)`;
  await SQL.query(query, [benchId, level]);
};
