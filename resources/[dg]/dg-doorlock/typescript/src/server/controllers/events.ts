import { Auth, Config, Events, Inventory, Police, RPC } from '@dgx/server';
import { Util } from '@dgx/shared';
import { areDoorsLoaded, changeDoorState, getAllDoors, getDoorById, registerNewDoor } from 'services/doors';

// Client and server event emit
Inventory.registerUseable('lockpick', (src, item) => {
  Events.emitNet('doorlock:client:useLockpick', src);
  emit('doorlock:server:useLockpick', src, item.id);
});

Inventory.registerUseable('thermite', src => {
  Events.emitNet('doorlock:client:useThermite', src);
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
