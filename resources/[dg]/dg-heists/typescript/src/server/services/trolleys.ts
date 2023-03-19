import config from './config';
import { mainLogger } from 'sv_logger';
import { TROLLEY_OBJECTS } from '../../shared/constants.trolleys';
import { Events, RPC, Util, Inventory } from '@dgx/server';
import heistManager from 'classes/heistmanager';

const activeTrolleys: Map<number, Heists.Trolley.Data> = new Map();
const trolleyLogger = mainLogger.child({ module: 'Trolleys' });

export const spawnTrolleys = (locationId: Heists.LocationId) => {
  const heistTypeConfig = heistManager.getHeistTypeConfigByLocationId(locationId);
  if (!heistTypeConfig) return;

  const trolleySpots = config.locations[locationId]?.trolleys;
  if (!trolleySpots) {
    trolleyLogger.error(`Could not find trolleyspots for ${locationId}`);
    return;
  }

  for (const trolleySpot of trolleySpots) {
    const trolleyType = heistTypeConfig.trolley.types[trolleySpot.type];
    if (!trolleyType) {
      trolleyLogger.error(`Trolleytype ${trolleySpot.type} was not a known type for location ${locationId}`);
      continue;
    }
    if (Util.getRndInteger(1, 101) > trolleyType.spawnChance) continue;

    const modelHash = TROLLEY_OBJECTS[trolleySpot.type].trolley;
    const entity = CreateObject(
      modelHash,
      trolleySpot.coords.x,
      trolleySpot.coords.y,
      trolleySpot.coords.z,
      true,
      false,
      false
    );

    Util.awaitCondition(() => DoesEntityExist(entity), 1000).then(() => {
      if (!DoesEntityExist(entity)) return;
      SetEntityHeading(entity, trolleySpot.coords.w);
      FreezeEntityPosition(entity, true);

      Entity(entity).state.set('heistTrolleyType', trolleySpot.type, true);
      activeTrolleys.set(entity, { type: trolleySpot.type, locationId, lootingPlayer: null });
    });
  }
};

RPC.register('heists:trolleys:startLooting', (plyId, trolleyNetId: number) => {
  const trolleyEntity = NetworkGetEntityFromNetworkId(trolleyNetId);
  if (!trolleyEntity || !DoesEntityExist(trolleyEntity)) return false;

  const activeTrolley = activeTrolleys.get(trolleyEntity);
  if (!activeTrolley || activeTrolley.lootingPlayer !== null) return false;

  activeTrolley.lootingPlayer = plyId;

  return true;
});

Events.onNet('heists:trolleys:finishLooting', (plyId, trolleyNetId: number) => {
  const trolleyEntity = NetworkGetEntityFromNetworkId(trolleyNetId);
  if (!trolleyEntity || !DoesEntityExist(trolleyEntity)) return;

  const activeTrolley = activeTrolleys.get(trolleyEntity);
  if (!activeTrolley || activeTrolley.lootingPlayer !== plyId) return;

  activeTrolleys.delete(trolleyEntity);
  setTimeout(() => {
    DeleteEntity(trolleyEntity);
  }, 5000);

  const heistTypeConfig = heistManager.getHeistTypeConfigByLocationId(activeTrolley.locationId);
  if (!heistTypeConfig) return;

  const trolleyTypeConfig = heistTypeConfig.trolley.types[activeTrolley.type];
  if (!trolleyTypeConfig) {
    trolleyLogger.error(
      `Trolleytype ${activeTrolley.type} was not a known type for location ${activeTrolley.locationId}`
    );
    return;
  }

  const [min, max] = trolleyTypeConfig.amount;
  Inventory.addItemToPlayer(plyId, trolleyTypeConfig.itemName, Util.getRndInteger(min, max + 1));
  Util.Log(
    'heists:trolleys:loot',
    {
      locationId: activeTrolley.locationId,
      type: activeTrolley.type,
    },
    `${Util.getName(plyId)}(${plyId}) received loot from a ${activeTrolley.type} trolley`,
    plyId
  );

  const specialItem = heistTypeConfig.trolley.specialItem;
  if (specialItem && Util.getRndInteger(1, 101) < specialItem.chance) {
    Inventory.addItemToPlayer(plyId, specialItem.item, 1);
    Util.Log(
      'heists:trolleys:specialLoot',
      {
        locationId: activeTrolley.locationId,
        type: activeTrolley.type,
        itemName: specialItem.item,
      },
      `${Util.getName(plyId)}(${plyId}) received special item loot from trolley`,
      plyId
    );
  }
});
