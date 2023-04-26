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

    const requirements: Materials.Crafting.Recipes.RecipeItem['requirements']['items'] = [];

    for (const recipeItem of recipe.items) {
      if (requirements.some(r => r.name === recipeItem.name)) {
        console.error(`Duplicate item in recipe ${itemName}`);
        continue;
      }
      requirements.push({ ...recipeItem, label: Inventory.getItemData(recipeItem.name).label });
    }

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
    const items = new Set(benchConfig.items);
    if (benchConfig.reputation === undefined) {
      let level = dbLevels.find(x => x.benchId === benchId)?.level;
      if (level === undefined) {
        updateBenchLevel(benchId, 0);
        level = 0;
      }
      data = { id: benchId, items, level };
    } else {
      data = { id: benchId, items, reputation: benchConfig.reputation };
    }
    if (benchConfig.visibleReputationLimit) {
      data.visibleReputationLimit = benchConfig.visibleReputationLimit;
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

const increaseReputationForBench = (bench: Materials.Crafting.Bench.Data, plyId: number, itemName: string) => {
  if ('reputation' in bench) {
    const cid = Util.getCID(plyId);
    Reputations.setReputation(cid, bench.reputation, rep => rep + 1);
    return;
  }

  const currentReputation = getReputationForBench(bench, plyId);
  if (currentReputation === undefined) return;
  if (!getRecipeByItemAndValidateReputation(bench, currentReputation, itemName)) return;

  // only increase reputation if item crafted was last item available
  // by passing -1 we pass rep check, so function just gets all items for bench
  // items are sorted from least rep to highest so we can use find
  const availableRecipes = getAvailableRecipes(bench, -1);
  const lastAvailableRecipe = availableRecipes.reverse().find(r => r.requiredReputation <= currentReputation);

  if (!lastAvailableRecipe) return;
  if (lastAvailableRecipe.UIData.name !== itemName) return;

  bench.level++;
  updateBenchLevel(bench.id, bench.level);
  craftingLogger.silly(`Level increased for bench ${bench.id}`);
};

const getRecipeByItemAndValidateReputation = (
  bench: Materials.Crafting.Bench.Data,
  reputation: number,
  itemName: string
) => {
  const recipe = recipes.get(itemName);
  if (!recipe) return;
  if (!bench.items.has(recipe.UIData.name)) return;

  if (reputation !== -1) {
    if (recipe.requiredReputation > reputation) return;

    if (bench.visibleReputationLimit) {
      if (recipe.requiredReputation >= bench.visibleReputationLimit) return;
    }
  }

  return recipe;
};

const getAvailableRecipes = (bench: Materials.Crafting.Bench.Data, reputation: number) => {
  const availableRecipes: Materials.Crafting.Recipes.Recipe[] = [];
  for (const itemName of recipes.keys()) {
    const recipe = getRecipeByItemAndValidateReputation(bench, reputation, itemName);
    if (!recipe) continue;
    availableRecipes.push(recipe);
  }
  return availableRecipes.sort((a, b) => (a.requiredReputation < b.requiredReputation ? -1 : 1));
};

global.exports('getBenchItems', (plyId: number, benchId: string) => {
  const bench = getBenchById(benchId);
  if (!bench) return;

  const reputation = getReputationForBench(bench, plyId);
  if (reputation === undefined) return; // logging happens in rep module

  const availableRecipes = getAvailableRecipes(bench, reputation);
  return availableRecipes.map(r => r.UIData);
});

global.exports('getItemRecipe', (plyId: number, benchId: string, itemName: string) => {
  const bench = getBenchById(benchId);
  if (!bench) return;

  const reputation = getReputationForBench(bench, plyId);
  if (reputation === undefined) return;

  const recipe = getRecipeByItemAndValidateReputation(bench, reputation, itemName);
  if (!recipe) return;

  return recipe.UIData;
});

on('inventory:craftedInBench', (plyId: number, benchId: string, item: Inventory.ItemState) => {
  const bench = getBenchById(benchId);
  if (!bench) return;
  increaseReputationForBench(bench, plyId, item.name);
  Util.Log(
    'materials:crafting:crafted',
    {
      benchId,
      itemId: item.id,
      itemName: item.name,
    },
    `${Util.getName(plyId)} has crafted ${item.name} in bench ${benchId}`,
    plyId
  );
});

const updateBenchLevel = async (benchId: string, level: number) => {
  const query = `INSERT INTO bench_levels (benchId, level) VALUES (?, ?) ON DUPLICATE KEY UPDATE level = VALUES(level)`;
  await SQL.query(query, [benchId, level]);
};
