import { Util, Inventory } from '@dgx/server';
import { Plant } from './plant';
import { EventListener, DGXEvent } from '@dgx/server/decorators';

@EventListener()
class PlantManager extends Util.Singleton<PlantManager>() {
  private readonly plants: Map<number, Plant>;
  private nextId: number;

  constructor() {
    super();
    this.plants = new Map();
    this.nextId = 1;
  }

  public getPlant = (plantId: number) => {
    return this.plants.get(plantId);
  };

  public addPlant = (seed: string, coords: Vec3) => {
    const plantId = this.nextId++;
    const plant = new Plant(plantId, seed, coords);
    this.plants.set(plantId, plant);
    return plant;
  };

  @DGXEvent('farming:plant:cut')
  private _cutPlant = (plyId: number, plantId: number) => {
    const plant = this.getPlant(plantId);
    if (!plant) return;

    plant.setAction('cut');

    Util.Log('farming:plant:cut', { plantId: plant.id }, `${Util.getName(plyId)} has done cut action on plant`, plyId);
  };

  @DGXEvent('farming:plant:water')
  private _waterPlant = async (plyId: number, plantId: number) => {
    const plant = this.getPlant(plantId);
    if (!plant) return;

    const bucketItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'farming_bucket');
    if (!bucketItem) return;

    Inventory.setMetadataOfItem(bucketItem.id, oldMetadata => ({ liter: oldMetadata.liter - 1 }));
    plant.setAction('water');

    Util.Log(
      'farming:plant:water',
      { plantId: plant.id },
      `${Util.getName(plyId)} has done water action on plant`,
      plyId
    );
  };

  @DGXEvent('farming:plant:feed')
  private _feedPlant = async (plyId: number, plantId: number, deluxe: boolean) => {
    const plant = plantManager.getPlant(plantId);
    if (!plant) return;

    const itemName = deluxe ? 'farming_fertilizer_deluxe' : 'farming_fertilizer';
    const removedItem = await Inventory.removeItemByNameFromPlayer(plyId, itemName);
    if (!removedItem) return;

    const action: Farming.ActionType = deluxe ? 'feedDeluxe' : 'feed';
    plant.setAction(action);

    Util.Log(
      'farming:plant:feed',
      { plantId: plant.id },
      `${Util.getName(plyId)} has done ${action} action on plant`,
      plyId
    );
  };

  @DGXEvent('farming:plant:harvest')
  private _harvestPlant = (plyId: number, plantId: number) => {
    const plant = plantManager.getPlant(plantId);
    if (!plant) return;

    plant.harvest(plyId);
    this.plants.delete(plant.id);

    Util.Log('farming:plant:harvest', { plantId: plant.id }, `${Util.getName(plyId)} has harvested a plant`, plyId);
  };
}

const plantManager = PlantManager.getInstance();
export default plantManager;
