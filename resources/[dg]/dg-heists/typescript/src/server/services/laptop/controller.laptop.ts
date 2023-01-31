import { Config, Events, Inventory, Notifications, RPC, Util } from '@dgx/server';

import doorStateManager from './../../controllers/classes/doorstatemanager';
import fleecaStateManager from './../../modules/fleeca/classes/statemanager';

const heistStateManagers: Record<Laptop.Name, Heist.StateManager|null> = {
  laptop_v1: fleecaStateManager,
  laptop_v2: null,
  laptop_v3: null,
  laptop_v5: null,
};

let laptopConfig: Laptop.Config;

setImmediate(async () => {
  await Config.awaitConfigLoad();
  laptopConfig = Config.getConfigValue<Laptop.Config>('heists.laptops');

  Inventory.registerUseable(Object.keys(heistStateManagers), async (src: number, itemState: Inventory.ItemState) => {
    const laptopName = itemState.name as Laptop.Name;

    const plyCoords = Util.getPlyCoords(src);
    const laptopLoc = Object.entries(laptopConfig.coords[laptopName]).find(
      ([id, coords]) => plyCoords.distance(coords) <= 2.0
    );
    if (!laptopLoc) return;
    const [heistId, hackLocation] = laptopLoc as [Heist.Id, Vec4];
    const laptopManager = heistStateManagers[laptopName];
    if (!laptopManager || !laptopManager.canHack(src, heistId)) {
      Notifications.add(src, 'Je kan dit momenteel niet hacken', 'error');
      return;
    }

    Inventory.setQualityOfItem(itemState.id, old => old - 20);
    laptopManager.startHack(src, heistId);
    Util.Log(
      'heists:hack:start',
      {
        id: heistId,
      },
      `${Util.getName(src)} started a hack at ${heistId}`,
      src
    );
    Events.emitNet('heists:client:startHack', src, laptopName, hackLocation);
  });
});

Events.onNet('heists:server:failedHack', async (src: number, laptopName: Laptop.Name, heistId: Heist.Id) => {
  if (!heistId) return;
  Util.Log(
    'heists:laptop:failed',
    {
      heist: heistId,
      laptopItem: laptopName,
    },
    `${GetPlayerName(String(src))} failed to hack the ${heistId} heist door with a ${laptopName}`,
    src
  );
  return heistStateManagers[laptopName]?.failedHack(src, heistId);
});

RPC.register('heists:server:finishHack', async (src: number, laptopName: Laptop.Name, heistId: Heist.Id) => {
  if (!heistId) return false;
  const removed = await Inventory.removeItemFromPlayer(src, laptopName);
  if (!removed) {
    Util.Log(
      'heists:laptop:error',
      {
        heist: heistId,
        laptopItem: laptopName,
      },
      `${GetPlayerName(String(src))} used ${laptopName} to hack ${heistId} but didn't have the item`,
      src
    );
    return false;
  }

  setTimeout(() => {
    doorStateManager.setDoorState(heistId, true);
  }, (laptopConfig.hackDelay ?? 5) * 60 * 1000);

  Util.Log(
    'heists:laptop:success',
    {
      heist: heistId,
      laptopItem: laptopName,
    },
    `${GetPlayerName(String(src))} successfully hacked the ${heistId} heist door with a  ${laptopName}`,
    src
  );
  return heistStateManagers[laptopName]?.finishedHack(src, heistId);
});
