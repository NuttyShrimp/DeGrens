import { Events, Inventory } from '@dgx/server';
import config from './config';

export const registerUseableSeeds = () => {
  const seeds = Object.entries(config.seeds);
  for (const [itemName, seed] of seeds) {
    Inventory.registerUseable(itemName, (plyId, itemState) => {
      Events.emitNet('farming:seed:place', plyId, itemState.id, seed.model, seed.zOffset);
    });
  }
};
