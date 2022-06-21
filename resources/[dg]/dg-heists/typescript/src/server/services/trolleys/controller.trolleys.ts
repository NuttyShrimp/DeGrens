import { Config, Events, Util } from '@dgx/server';

Events.onNet('heists:server:lootTrolley', async (src: number, heistId: Heist.Id, type: Trolley.Type) => {
  if (!heistId || !type) throw new Error('Attempted to receive trolley loot without providing correct data');
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue<Trolley.Config>('heists.trolleys');
  const Player = DGCore.Functions.GetPlayer(src);
  const possibleLoot = config[heistId].types[type];
  const loot = possibleLoot[Math.floor(Math.random() * possibleLoot.length)];
  Player.Functions.AddItem(loot.name, Util.getRndInteger(loot.min, loot.max));
  emitNet('inventory:client:ItemBox', src, loot.name, 'add');

  if (Util.getRndInteger(0, 100) < config[heistId].specialChance) {
    const specialItems = config[heistId].specialItems;
    const specialItem = specialItems[Math.floor(Math.random() * specialItems.length)];
    Player.Functions.AddItem(specialItem, 1);
    emitNet('inventory:client:ItemBox', src, specialItem, 'add');
  }
});
