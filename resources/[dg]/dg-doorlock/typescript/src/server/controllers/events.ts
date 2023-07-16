import { Auth, Config, Events, Inventory, Jobs, Notifications, Police, Util } from '@dgx/server';
import { areDoorsLoaded, changeDoorState, getAllDoors, getDoorById, registerNewDoor } from 'services/doors';

// Client and server event emit
Inventory.registerUseable('lockpick', (src, item) => {
  Events.emitNet('doorlock:client:useLockpick', src);
  emit('doorlock:server:useLockpick', src, item.id);
});

Inventory.registerUseable('thermite', src => {
  Events.emitNet('doorlock:client:useThermite', src);
});

Inventory.registerUseable('detcord', plyId => {
  if (Jobs.getCurrentJob(plyId) !== 'police') {
    Notifications.add(plyId, 'Dit is enkel voor overheidsdiensten', 'error');
    return;
  }

  Events.emitNet('doorlock:client:useDetcord', plyId);
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
      title: 'Poging tot inbraak',
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
