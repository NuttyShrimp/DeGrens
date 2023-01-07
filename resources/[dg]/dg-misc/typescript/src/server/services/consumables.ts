import { Config, Hospital, Inventory, Taskbar } from '@dgx/server';

setImmediate(async () => {
  await Config.awaitConfigLoad();
  const config = await Config.getConfigValue('inventory.consumables');
  registerUsables(config);
});

const registerUsables = (config: Config.Consumables) => {
  config.food.forEach(food => registerFood(food));
  config.drink.normal.forEach(drink => registerDrink(drink));
  config.drink.alcohol.forEach(drink => registerAlcoholDrink(drink));
};

const registerFood = (info: Config.Consumable) => {
  Inventory.registerUseable(info.name, async (src, item) => {
    Inventory.destroyItem(item.id);
    emitNet('animations:client:EmoteCommandStart', src, ['eat']);
    const [isCancelled] = await Taskbar.create(src, 'burger', 'Eten...', 5000, {
      controlDisables: {
        combat: true,
      },
      canCancel: true,
      cancelOnDeath: true,
      disarm: true,
    });
    emitNet('animations:client:EmoteCommandStart', src, ['c']);
    if (isCancelled) return;
    Hospital.setNeed(src, 'hunger', old => old + info.gain);
  });
};

const handleDrinkUse = async (src: number, item: Inventory.ItemState, info: Config.Consumable) => {
  Inventory.destroyItem(item.id);
  emitNet('animations:client:EmoteCommandStart', src, ['drink']);
  const [isCancelled] = await Taskbar.create(src, 'bottle-water', 'Drinken...', 5000, {
    controlDisables: {
      combat: true,
    },
    canCancel: true,
    cancelOnDeath: true,
    disarm: true,
  });
  emitNet('animations:client:EmoteCommandStart', src, ['c']);
  if (isCancelled) return;
  Hospital.setNeed(src, 'thirst', old => old + info.gain);
};

const registerDrink = (info: Config.Consumable) => {
  Inventory.registerUseable(info.name, (src, item) => {
    handleDrinkUse(src, item, info);
  });
};

const registerAlcoholDrink = (info: Config.Consumable) => {
  Inventory.registerUseable(info.name, async (src, item) => {
    await handleDrinkUse(src, item, info);
    // TODO: Add drunk effect if drank enough
  });
};
