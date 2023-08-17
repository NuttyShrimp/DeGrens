import { Auth, Config, Events, Inventory, Jobs, Notifications, Police, Util } from '@dgx/server';
import { areDoorsLoaded, changeDoorState, getAllDoors, getDoorById, registerNewDoor } from 'services/doors';

// Client and server event emit
Inventory.registerUseable('lockpick', (plyId, item) => {
  Events.emitNet('doorlock:client:useLockpick', plyId);
  emit('doorlock:server:useLockpick', plyId, item.id);
});

Inventory.registerUseable('thermite', (plyId, itemState) => {
  Events.emitNet('doorlock:client:useThermite', plyId, itemState.id);
});

Inventory.registerUseable('detcord', (plyId, itemState) => {
  if (Jobs.getCurrentJob(plyId) !== 'police') {
    Notifications.add(plyId, 'Dit is enkel voor overheidsdiensten', 'error');
    return;
  }

  Events.emitNet('doorlock:client:useDetcord', plyId, itemState.id);
});

Inventory.registerUseable('gate_unlock_tool', async (plyId, itemState) => {
  const hasLaptop = await Inventory.doesPlayerHaveItems(plyId, ['laptop']);
  if (!hasLaptop) {
    Notifications.add(plyId, 'Je hebt geen laptop om dit te gebruiken', 'error');
    return;
  }
  Events.emitNet('doorlock:client:useGateUnlock', plyId, itemState.id);
});

Events.onNet('doorlock:server:finishGateUnlock', async (plyId, doorId: number, itemId: string, success: boolean) => {
  const hasItem = await Inventory.doesPlayerHaveItemWithId(plyId, itemId);
  if (!hasItem) {
    Notifications.add(plyId, 'Je hebt dit item niet meer');
    return;
  }

  Inventory.setQualityOfItem(itemId, old => old - 20);
  if (success) {
    changeDoorState(doorId, false);
  }
  Util.Log(
    'doorlock:gateunlock',
    { doorId, itemId, success },
    `${Util.getName(plyId)}(${plyId}) has ${success ? 'succesfully' : 'failed to'} unlock door using gateunlock`,
    plyId
  );
});

Auth.onAuth(async plyId => {
  await Util.awaitCondition(() => areDoorsLoaded());
  Events.emitNet('doorlock:client:loadDoors', plyId, getAllDoors());
});

Events.onNet('doorlock:server:changeDoorState', (src: number, doorId: number, state: boolean) => {
  changeDoorState(doorId, state);
});

Events.onNet('doorlock:server:triedLockpickingDoor', async (src: number, doorId: number) => {
  await Util.awaitCondition(() => areDoorsLoaded());

  const data = getDoorById(doorId);
  if (!data) return;

  const rng = Util.getRndInteger(1, 101);
  if (rng < Config.getConfigValue('dispatch.callChance.doorlockpick')) {
    Police.createDispatchCall({
      tag: '10-31',
      title: 'Poging Inbraak Deur',
      description: 'Er was een verdacht persoon aan een deur aan het prutsen',
      coords: data.coords,
      skipCoordsRandomization: true,
      criminal: src,
      blip: {
        sprite: 102,
        color: 0,
      },
    });
  }
});

Events.onNet('doorlock:server:registerNew', (src: number, config: Doorlock.DoorConfig) => {
  registerNewDoor(config);
});

Events.onNet('doorlock:server:logDetcord', async (plyId: number) => {
  Util.Log('doorlock:detcord', {}, `${Util.getName(plyId)}(${plyId}) has detcorded a door`, plyId);
});
