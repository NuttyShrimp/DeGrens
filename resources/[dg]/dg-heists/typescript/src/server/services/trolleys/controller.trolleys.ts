import { Events, Util } from '@dgx/server';
import { TROLLEY_LOOT } from './constants.trolleys';

Events.onNet('heists:server:lootTrolley', (src: number, heistId: Heist.Id, type: Trolley.Type) => {
  if (!heistId || !type) throw new Error('Attempted to receive trolley loot without providing correct data');
  const Player = DGCore.Functions.GetPlayer(src);
  const possibleLoot = TROLLEY_LOOT[heistId].types[type];
  const loot = possibleLoot[Math.floor(Math.random() * possibleLoot.length)];
  Player.Functions.AddItem(loot.name, Util.getRndInteger(loot.min, loot.max));
  emitNet('inventory:client:ItemBox', src, loot.name, 'add');

  if (Util.getRndInteger(0, 100) < TROLLEY_LOOT[heistId].specialChance) {
    const specialItems = TROLLEY_LOOT[heistId].specialItems;
    const specialItem = specialItems[Math.floor(Math.random() * specialItems.length)];
    Player.Functions.AddItem(specialItem, 1);
    emitNet('inventory:client:ItemBox', src, specialItem, 'add');
  }
});
