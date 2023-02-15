import { Events } from '@dgx/client';
import { buildFarmingZones } from '../services/zones';
import { findSeedCoords, setPlantModels } from 'services/seeds';

Events.onNet('farming:client:init', (farmingZones: Farming.Config['farmingZones'], plantModels: number[]) => {
  buildFarmingZones(farmingZones);
  setPlantModels(plantModels);
});

Events.onNet('farming:seed:place', async (itemId: string, entityModel: string, zOffset: number) => {
  const plantCoords = await findSeedCoords(entityModel, zOffset);
  if (!plantCoords) return;
  Events.emitNet('farming:seed:place', itemId, plantCoords);
});
