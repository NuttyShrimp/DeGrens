import { Config, Events, Inventory, Util } from '@dgx/server';
import { getTypeForId } from 'services/metadata';

let config: Trolley.Config;

setImmediate(() => {
  config = Config.getConfigValue<Trolley.Config>('heists.trolleys');
});

Events.onNet('heists:server:lootTrolley', async (src: number, heistId: Heist.Id, type: Trolley.Type) => {
  if (!heistId || !type) throw new Error('Attempted to receive trolley loot without providing correct data');
  await Config.awaitConfigLoad();
  const heistType = getTypeForId(heistId);
  if (!heistType) return;
  const heistConfig = config.heists[heistType]
  if (!heistConfig) return;
  const possibleLoot = config.heists[heistType]!.types[type];
  if (!possibleLoot) return;
  const loot = possibleLoot[Math.floor(Math.random() * possibleLoot.length)];
  Inventory.addItemToPlayer(src, loot.name, Util.getRndInteger(loot.min, loot.max));
  Util.Log(
    'heists:trolley:loot',
    {
      heistId,
      type,
      loot,
    },
    `${GetPlayerName(src.toString())} received loot from a ${type} trolley`,
    src
  );

  const chance = Util.getRndInteger(0, 100);
  if (chance < heistConfig.specialChance) {
    const specialItems = heistConfig.specialItems;
    const specialItem = specialItems[Math.floor(Math.random() * specialItems.length)];
    Inventory.addItemToPlayer(src, specialItem, 1);
    Util.Log(
      'heists:trolley:specialLoot',
      {
        heistId,
        specialItem,
        chance,
      },
      `${GetPlayerName(src.toString())} received a special item`,
      src
    );
  }
});
