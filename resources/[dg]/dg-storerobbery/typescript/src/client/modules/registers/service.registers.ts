import { Events, Notifications, PolyZone, RPC, Taskbar, Util, Inventory, Minigames, Police } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import locationManager from 'classes/LocationManager';

const registerZones: Partial<Record<Storerobbery.Id, Storerobbery.Data['registerzone']>> = {};

let inRegisterZone = false;
let robAnimTime = 0;

export const setRegisterZones = (storeConfig: Storerobbery.Config['stores']) => {
  for (const [id, store] of Object.entries(storeConfig)) {
    registerZones[id as Storerobbery.Id] = store.registerzone;
  }
};

export const buildRegisterZone = async (storeId: Storerobbery.Id) => {
  const zone = registerZones[storeId];
  if (!zone) {
    console.log('Failed to build register zone');
    return;
  }

  PolyZone.addBoxZone('store_registers', zone.center, zone.length, zone.width, { ...zone.options, data: {} });
};

export const destroyRegisterZone = () => {
  PolyZone.removeZone('store_registers');
};

export const setInRegisterZone = (val: boolean) => {
  inRegisterZone = val;
};

export const canRobRegister = () => {
  if (!inRegisterZone || !locationManager.currentStore) return false;
  return Police.enoughCopsForActivity('storerobbery_register');
};

export const lockpickRegister = async (registerObject: number) => {
  if (!canRobRegister()) {
    Notifications.add('Je kan dit momenteel niet', 'error');
    return;
  }

  const registerCoords = Util.getEntityCoords(registerObject);
  const isRobbed = await RPC.execute<boolean>('storerobbery:server:isRegisterRobbed', registerCoords);
  if (isRobbed) {
    Notifications.add('Deze kassa is al open...', 'error');
    return;
  }

  if (HasObjectBeenBroken(registerObject)) {
    Events.emitNet('storerobbery:server:startJob', locationManager.currentStore, 'register');
    lootRegister(registerCoords);
    return;
  }

  const hasLockpick = await Inventory.doesPlayerHaveItems('lockpick');
  if (!hasLockpick) {
    Notifications.add('Hoe ga je dit openen?', 'error');
    return;
  }

  Events.emitNet('storerobbery:server:startJob', locationManager.currentStore, 'register');
  const keygameSuccess = await Minigames.keygame(5, 10, 15);
  if (keygameSuccess) {
    lootRegister(registerCoords);
  } else {
    if (Util.getRndInteger(0, 100) < 10) {
      Inventory.removeItemFromPlayer('lockpick');
      Notifications.add('Je lockpick is gebroken', 'error');
    } else {
      Notifications.add('Je bent uitgeschoven', 'error');
      Events.emitNet('police:evidence:addBloodDrop');
    }
  }
};

export const lootRegister = async (registerObject: Vector3) => {
  doRobAnimation();
  const [canceled] = await Taskbar.create('cash-register', 'Kassa beroven...', 20 * 1000, {
    canCancel: true,
    cancelOnDeath: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  ClearPedTasks(PlayerPedId());
  robAnimTime = 0;
  if (canceled) return;
  Events.emitNet('storerobbery:server:robRegister', registerObject);
};

export const doRobAnimation = async () => {
  const ped = PlayerPedId();
  robAnimTime = 20 * 1000 - 1000; // accounts for exit anim
  await Util.loadAnimDict('oddjobs@shop_robbery@rob_till');
  const interval = setInterval(() => {
    if (robAnimTime <= 0) {
      clearInterval(interval);
      TaskPlayAnim(ped, 'oddjobs@shop_robbery@rob_till', 'exit', 2.0, 2.0, -1, 16, 0, false, false, false);
      RemoveAnimDict('oddjobs@shop_robbery@rob_till');
      return;
    }
    TaskPlayAnim(ped, 'oddjobs@shop_robbery@rob_till', 'loop', 2.0, 2.0, -1, 16, 0, false, false, false);
    robAnimTime -= 1650;
  }, 1650);
};
