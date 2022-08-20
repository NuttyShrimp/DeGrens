import { Events, Notifications, RPC, Util, Config, Inventory } from '@dgx/server';
import fleecaStateManager from './../../modules/fleeca/classes/statemanager';
import doorStateManager from './../../controllers/classes/doorstatemanager';

const heistStateManagers: Record<Laptop.Name, Heist.StateManager> = {
  laptop_v1: fleecaStateManager,
  laptop_v2: null,
  laptop_v3: null,
  laptop_v5: null,
};

let laptopConfig: Laptop.Config;
setImmediate(async () => {
  await Config.awaitConfigLoad();
  laptopConfig = Config.getConfigValue<Laptop.Config>('heists.laptops');

  // TODO: Quality decrease on laptop use
  const laptopNames = Object.keys(laptopConfig.interactCoords);
  Inventory.registerUseable(laptopNames, async (src: number, itemState: Inventory.ItemState) => {
    const laptopName = itemState.name as Laptop.Name;

    const plyCoords = Util.getPlyCoords(src);
    const hackLocation = laptopConfig.interactCoords[laptopName].find(coord => plyCoords.distance(coord) <= 1.0);
    if (!hackLocation) return;

    const heistId = await RPC.execute<Heist.Id>('heists:client:getCurrentLocation', src);
    if (!heistId) return;

    if (!heistStateManagers[laptopName]?.canHack(heistId)) {
      Notifications.add(src, 'Je kan dit momenteel niet hacken', 'error');
      return;
    }

    Events.emitNet('heists:client:startHack', src, laptopName, hackLocation);
  });
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
  heistStateManagers[laptopName]?.finishedHack(heistId);
});
