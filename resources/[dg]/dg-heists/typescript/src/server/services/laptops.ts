import { Events, Inventory, Notifications, Police, Util } from '@dgx/server';
import config from './config';
import heistManager from 'classes/heistmanager';
import { mainLogger } from 'sv_logger';

const hackingPlayers = new Map<number, { locationId: Heists.LocationId; itemId: string }>();
const laptopLogger = mainLogger.child({ module: 'Laptops' });

export const registerLaptopUsageHandlers = () => {
  Inventory.registerUseable(Object.keys(config.laptops.laptops), async (plyId, itemState) => {
    const plyCoords = Util.getPlyCoords(plyId);

    const laptopConfig = config.laptops.laptops[itemState.name];
    if (!laptopConfig) return;

    const closestLocation = Object.entries(config.locations).find(
      ([_, loc]) => loc.type === laptopConfig.heistType && loc.laptopCoords && plyCoords.distance(loc.laptopCoords) < 2
    );
    if (!closestLocation) return;
    const [locationId, locationData] = closestLocation as [Heists.LocationId, Heists.Location];

    const laptopServiceUsed = heistManager.isServiceUsedAtLocation(locationId, 'laptop');
    if (!laptopServiceUsed) return;

    // check if no one else hacking this shit
    for (const [_, hackData] of hackingPlayers) {
      if (hackData.locationId === locationId) {
        Notifications.add(plyId, 'Er is iemand hier al aan het hacken', 'error');
        return;
      }
    }

    const canHack = heistManager.canHackLocation(locationId);
    if (!canHack) {
      Notifications.add(plyId, 'Je kan dit momenteel niet hacken', 'error');
      return;
    }

    Inventory.setQualityOfItem(itemState.id, old => old - 25);
    heistManager.startHackAtLocation(locationId);
    hackingPlayers.set(plyId, { locationId, itemId: itemState.id });
    Events.emitNet('heists:laptops:startHack', plyId, locationData.laptopCoords, laptopConfig);

    Police.createDispatchCall({
      tag: '10-90',
      title: `Overval: ${locationData.label}`,
      blip: {
        sprite: 618,
        color: 1,
      },
      coords: locationData.laptopCoords,
      skipCoordsRandomization: true,
      entries: {
        'camera-cctv': locationData.cams.join(', '),
      },
      important: true,
    });

    const logMsg = `${Util.getName(plyId)}(${plyId}) start hack at ${locationId}`;
    laptopLogger.info(logMsg);
    Util.Log(
      'heists:laptops:start',
      {
        locationId,
      },
      logMsg,
      plyId
    );
  });
};

Events.onNet('heists:laptops:finishHack', async (plyId, success: boolean) => {
  const hackData = hackingPlayers.get(plyId);
  if (!hackData) return;
  hackingPlayers.delete(plyId);

  if (!success) {
    heistManager.finishHackAtLocation(hackData.locationId, false);
    const logMsg = `${Util.getName(plyId)}(${plyId}) failed laptophack at ${hackData.locationId}`;
    laptopLogger.info(logMsg);
    Util.Log(
      'heists:laptops:failed',
      {
        ...hackData,
      },
      logMsg,
      plyId
    );
    return;
  }

  Inventory.destroyItem(hackData.itemId);
  heistManager.finishHackAtLocation(hackData.locationId, true);

  const hackDuration = Util.isDevEnv() ? 0 : config.laptops.hackDuration;
  setTimeout(() => {
    heistManager.spawnTrolleysAtLocation(hackData.locationId);
    heistManager.setLocationDoorState(hackData.locationId, true);
  }, hackDuration * 60 * 1000);

  const logMsg = `${Util.getName(plyId)}(${plyId}) succeeded laptophack at ${hackData.locationId}`;
  laptopLogger.info(logMsg);
  Util.Log(
    'heists:laptops:success',
    {
      ...hackData,
    },
    logMsg,
    plyId
  );
});
