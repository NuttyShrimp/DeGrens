import { Config, Events, Inventory, Notifications, Taskbar } from "@dgx/server";

setImmediate(async () => {
  await Config.awaitConfigLoad();
  const config = await Config.getConfigValue('inventory.consumables');
  registerUsables(config);
})

const registerUsables = (config: Config.Consumables) => {
  config.food.forEach(food => registerFood(food));
  config.drink.normal.forEach(drink => registerDrink(drink));
  config.drink.alcohol.forEach(drink => registerAlcoholDrink(drink));
}

const registerFood = (info: Config.Consumable) => {
  Inventory.registerUseable(info.name, async (src, item) => {
    const success = await Inventory.removeItemByIdFromPlayer(src, item.name);
    if (success) {
      emitNet('animations:client:EmoteCommandStart', src, ["eat"]);
      const [isCancelled] = await Taskbar.create(src, "burger", "Eten...", 5000, {
        controlDisables: {
          combat: true
        },
        canCancel: true,
        cancelOnDeath: true,
      });
      emitNet('animations:client:EmoteCommandStart', src, ["c"]);
      if (isCancelled) {
        Notifications.add(src, "Geannulleerd..");
        return;
      }
      const Player = DGCore.Functions.GetPlayer(src);
      Player.Functions.SetMetaData("hunger", Player.PlayerData.metadata.hunger + info.gain);
    }
  });
};

const handleDrinkUse = async (src: number, item: Inventory.ItemState, info: Config.Consumable) => {
    const success = await Inventory.removeItemByIdFromPlayer(src, item.name);
    if (success) {
      emitNet('animations:client:EmoteCommandStart', src, ["drink"]);
      const [isCancelled] = await Taskbar.create(src, "bottle-water", "Drinken...", 5000, {
        controlDisables: {
          combat: true
        },
        canCancel: true,
        cancelOnDeath: true,
      });
      emitNet('animations:client:EmoteCommandStart', src, ["c"]);
      if (isCancelled) {
        Notifications.add(src, "Geannulleerd..");
        return false;
      }
      const Player = DGCore.Functions.GetPlayer(src);
      Player.Functions.SetMetaData("thirst", Player.PlayerData.metadata.thirst + info.gain);
    }
    return success;
}

const registerDrink = (info: Config.Consumable) => {
  Inventory.registerUseable(info.name, async (src, item) => {
    handleDrinkUse(src, item, info)
  });
}

const registerAlcoholDrink = (info: Config.Consumable) => {
  Inventory.registerUseable(info.name, async (src, item) => {
    const success = await handleDrinkUse(src, item, info)
    if (success) {
      // TODO: Add drunk effect if drank enough
    }
  });
}
