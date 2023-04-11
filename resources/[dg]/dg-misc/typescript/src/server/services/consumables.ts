import { Config, Events, Hospital, Inventory, Minigames, Notifications, Taskbar } from '@dgx/server';

const effects: Record<Config.EffectConsumable['effect'], (target: number, duration: number, itemId: string) => void> = {
  stress: async (target, duration, itemId) => {
    const success = await Inventory.removeItemByIdFromPlayer(target, itemId);
    if (!success) {
      Notifications.add(target, 'Item is verdwenen?..');
      return;
    }
    Events.emitNet('misc:consumables:applyEffect', target, 'stress', duration);
  },
  speed: async (target, duration, itemId) => {
    let success = await Minigames.keygame(target, 1, 4, 18);
    if (!success) return;
    const [isCancelled] = await Taskbar.create(target, 'nose', 'sniffing drugs', 5000, {
      canCancel: true,
      cancelOnDeath: true,
      controlDisables: {
        combat: true,
      },
      disableInventory: true,
      animation: {
        animDict: 'anim@amb@nightclub@peds@',
        anim: 'missfbi3_party_snort_coke_b_male3',
        flags: 49,
      },
    });
    if (isCancelled) {
      Notifications.add(target, 'Geannuleerd...', 'error');
      return;
    }
    success = await Inventory.removeItemByIdFromPlayer(target, itemId);
    if (!success) {
      Notifications.add(target, 'Item is verdwenen?..');
      return;
    }
    Events.emitNet('misc:consumables:applyEffect', target, 'speed', duration);
  },
  damage: async (target, duration, itemId) => {
    let success = await Minigames.keygame(target, 1, 6, 13);
    if (!success) return;
    const [isCancelled] = await Taskbar.create(target, 'nose', 'sniffing drugs', 5000, {
      canCancel: true,
      cancelOnDeath: true,
      controlDisables: {
        combat: true,
      },
      disableInventory: true,
      animation: {
        animDict: 'anim@amb@nightclub@peds@',
        anim: 'missfbi3_party_snort_coke_b_male3',
        flags: 49,
      },
    });
    if (isCancelled) {
      Notifications.add(target, 'Geannuleerd...', 'error');
      return;
    }
    success = await Inventory.removeItemByIdFromPlayer(target, itemId);
    if (!success) {
      Notifications.add(target, 'Item is verdwenen?..');
      return;
    }
    Events.emitNet('misc:consumables:applyEffect', target, 'damage', duration);
  },
};

setImmediate(async () => {
  await Config.awaitConfigLoad();
  const config = await Config.getConfigValue('inventory.consumables');
  registerUsables(config);
});

const registerUsables = (config: Config.Consumables) => {
  config.food.forEach(food => registerFood(food));
  config.drink.normal.forEach(drink => registerDrink(drink));
  config.drink.alcohol.forEach(drink => registerAlcoholDrink(drink));
  config.drugs.forEach(drug => registerDrug(drug));
};

const registerFood = (info: Config.Consumable) => {
  Inventory.registerUseable(info.name, async (src, item) => {
    emitNet('animations:client:EmoteCommandStart', src, ['eat']);
    const [isCancelled] = await Taskbar.create(src, 'burger', 'Eten...', 5000, {
      controlDisables: {
        combat: true,
      },
      canCancel: true,
      cancelOnDeath: true,
    });
    emitNet('animations:client:EmoteCommandStart', src, ['c']);
    if (isCancelled) {
      Notifications.add(src, 'Geannuleerd..');
      return;
    }
    const success = await Inventory.removeItemByIdFromPlayer(src, item.id);
    if (!success) {
      Notifications.add(src, 'Item is verdwenen?..');
      return;
    }

    const gain = calculateGain(info, item);
    Hospital.setNeed(src, 'hunger', old => old + gain);
  });
};

const handleDrinkUse = async (src: number, item: Inventory.ItemState, info: Config.Consumable) => {
  emitNet('animations:client:EmoteCommandStart', src, ['drink']);
  const [isCancelled] = await Taskbar.create(src, 'bottle-water', 'Drinken...', 5000, {
    controlDisables: {
      combat: true,
    },
    canCancel: true,
    cancelOnDeath: true,
  });
  emitNet('animations:client:EmoteCommandStart', src, ['c']);
  if (isCancelled) {
    Notifications.add(src, 'Geannuleerd..');
    return false;
  }
  const success = await Inventory.removeItemByIdFromPlayer(src, item.id);
  if (!success) {
    Notifications.add(src, 'Item is verdwenen?..');
    return false;
  }

  const gain = calculateGain(info, item);
  Hospital.setNeed(src, 'thirst', old => old + gain);
  return success;
};

const registerDrink = (info: Config.Consumable) => {
  Inventory.registerUseable(info.name, async (src, item) => {
    handleDrinkUse(src, item, info);
  });
};

const registerAlcoholDrink = (info: Config.Consumable) => {
  Inventory.registerUseable(info.name, async (src, item) => {
    const success = await handleDrinkUse(src, item, info);
    if (success) {
      Events.emitNet('misc:consumables:applyAlcohol', src, info.gain);
    }
  });
};

const registerDrug = (info: Config.EffectConsumable) => {
  Inventory.registerUseable(info.name, async (src, item) => {
    effects[info.effect](src, info.duration, item.id);
  });
};

// quality of metadata can influence gain, we scale from 25-100 to always get a bit at least
const calculateGain = (info: Config.Consumable, item: Inventory.ItemState) => {
  let gain = info.gain;
  if (info.checkQuality) {
    const quality = item.metadata.quality;
    if (quality !== undefined) {
      gain *= Math.round((quality * 0.75 + 25) * 10) / 1000;
    }
  }
  return gain;
};
