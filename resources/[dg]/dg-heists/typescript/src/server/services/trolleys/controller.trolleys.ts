import { Config, Events, Inventory, Util } from '@dgx/server';

Events.onNet('heists:server:lootTrolley', async (src: number, heistId: Heist.Id, type: Trolley.Type) => {
  if (!heistId || !type) throw new Error('Attempted to receive trolley loot without providing correct data');
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue<Trolley.Config>('heists.trolleys');
  const possibleLoot = config[heistId].types[type];
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
  if (chance < config[heistId].specialChance) {
    const specialItems = config[heistId].specialItems;
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
