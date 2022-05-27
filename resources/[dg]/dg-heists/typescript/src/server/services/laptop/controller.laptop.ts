import { Events, Notifications, RPC, Util } from '@dgx/server';
import { HACK_LOCATIONS, OPENING_DELAY } from './constants.laptops';
import fleecaStateManager from './../../modules/fleeca/classes/statemanager';
import doorStateManager from './../../controllers/classes/doorstatemanager';

const heistStateManagers: Record<Laptop.Name, any> = {
  laptop_v1: fleecaStateManager,
  laptop_v2: null,
  laptop_v3: null,
  laptop_v5: null,
};

// TODO: Quality decrease on laptop use
Object.keys(HACK_LOCATIONS).forEach(laptopName => {
  DGCore.Functions.CreateUseableItem(laptopName, async (src: number, item: Item) => {
    const laptopName = item.name as Laptop.Name;
    const Player = DGCore.Functions.GetPlayer(src);
    if (!Player.Functions.GetItemByName(laptopName)) return;

    const plyCoords = Util.getPlyCoords(src);
    const hackLocation = HACK_LOCATIONS[laptopName].find(coord => plyCoords.distance(coord) <= 1.0);
    if (!hackLocation) return;

    const heistId = RPC.execute<Heist.Id>('heists:client:getCurrentLocation', src);
    if (!heistId) return;

    if (!heistStateManagers[laptopName]?.canHack(heistId)) {
      Notifications.add(src, 'Je kan dit momenteel niet hacken', 'error');
      return;
    }

    Events.emitNet('heists:client:startHack', src, laptopName, hackLocation);
  });
});

RPC.register('heists:server:finishHack', (src: number, laptopName: Laptop.Name, heistId: Heist.Id) => {
  if (!heistId) return false;
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player.Functions.RemoveItem(laptopName, 1)) return false;

  setTimeout(() => {
    doorStateManager.setDoorState(heistId, true);
  }, OPENING_DELAY[heistId]);

  heistStateManagers[laptopName]?.finishedHack(heistId);
});
