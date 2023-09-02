import config from './config';
import { mainLogger } from 'sv_logger';
import { TROLLEY_OBJECTS } from '../../shared/constants.trolleys';
import { Events, RPC, Util, Inventory } from '@dgx/server';
import heistManager from 'classes/heistmanager';

const activeTrolleys: Map<number, Heists.Trolley.Data> = new Map();
const trolleyLogger = mainLogger.child({ module: 'Trolleys' });

const getTrolleyDataByEntity = (entity: number) => {
  const trolley = activeTrolleys.get(entity);
  if (!trolley) return;
  const typeStatebag: Heists.Trolley.Type = Entity(entity).state.heistTrolleyType;
  if (trolley.type !== typeStatebag) return;
  return trolley;
};

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
    const entity = CreateObjectNoOffset(
      modelHash,
      trolleySpot.coords.x,
      trolleySpot.coords.y,
      trolleySpot.coords.z,
      true,
      false,
      false
    );

    Util.awaitEntityExistence(entity).then(() => {
      if (!DoesEntityExist(entity)) return;

      SetEntityHeading(entity, trolleySpot.coords.w);
      FreezeEntityPosition(entity, true);
      Entity(entity).state.set('heistTrolleyType', trolleySpot.type, true);

      activeTrolleys.set(entity, {
        type: trolleySpot.type,
        locationId,
        lootingPlayer: null,
        deleteTimeout: setTimeout(
          () => {
            activeTrolleys.delete(entity);
            deleteTrolleyEntity(entity);
          },
          10 * 60 * 1000
        ),
      });
    });
  }
};

RPC.register('heists:trolleys:startLooting', (plyId, trolleyNetId: number) => {
  const trolleyEntity = NetworkGetEntityFromNetworkId(trolleyNetId);
  if (!trolleyEntity || !DoesEntityExist(trolleyEntity)) return false;

  const activeTrolley = getTrolleyDataByEntity(trolleyEntity);
  if (!activeTrolley || activeTrolley.lootingPlayer !== null) return false;

  if (activeTrolley.deleteTimeout) {
    clearTimeout(activeTrolley.deleteTimeout);
    activeTrolley.deleteTimeout = null;
  }
  activeTrolley.lootingPlayer = plyId;

  return true;
});

Events.onNet('heists:trolleys:finishLooting', (plyId, trolleyNetId: number) => {
  const trolleyEntity = NetworkGetEntityFromNetworkId(trolleyNetId);
  if (!trolleyEntity || !DoesEntityExist(trolleyEntity)) return;

  const activeTrolley = getTrolleyDataByEntity(trolleyEntity);
  if (!activeTrolley || activeTrolley.lootingPlayer !== plyId) return;

  activeTrolleys.delete(trolleyEntity);
  setTimeout(() => {
    deleteTrolleyEntity(trolleyEntity);
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

  Util.changePlayerStress(plyId, 10);

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

export const removeAllTrolleyObjects = () => {
  for (const [ent, t] of activeTrolleys) {
    if (t.deleteTimeout) {
      clearInterval(t.deleteTimeout);
    }
    deleteTrolleyEntity(ent);
  }
};

const deleteTrolleyEntity = (entity: number) => {
  if (!DoesEntityExist || !getTrolleyDataByEntity(entity)) {
    console.error('Tried to delete trolley entity but did not match statebag');
    return;
  }

  DeleteEntity(entity);
};
