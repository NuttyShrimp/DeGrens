import { Events, Notifications, PolyZone, Taskbar, Util, Police, Minigames, Inventory } from '@dgx/client';
import locationManager from 'classes/LocationManager';
import { LOCKPICK_ANIM } from './constants.registers';
import { generateKeygameSequence } from './helpers.registers';

const registerZones: Partial<Record<Storerobbery.Id, Storerobbery.Data['registerzone']>> = {};

let inRegisterZone = false;
let cancelRobAnim = false;

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

export const canLockpickRegister = () => {
  if (!inRegisterZone || !locationManager.currentStore) return false;
  return Police.canDoActivity('storerobbery_register');
};

export const tryToLockpick = async (registerObject: number) => {
  if (!locationManager.currentStore) return;

  if (!canLockpickRegister()) {
    Notifications.add('Je kan dit momenteel niet', 'error');
    return;
  }

  const heading = Util.getHeadingToFaceEntity(registerObject);
  await Util.goToCoords({ ...Util.getPlyCoords(), w: heading }, 2000);

  const isBroken = HasObjectBeenBroken(registerObject);
  const registerCoords = Util.getEntityCoords(registerObject);
  Events.emitNet('storerobbery:registers:tryToRob', locationManager.currentStore, registerCoords, isBroken);
};

export const lootRegister = async (registerIdx: number, isBroken: boolean) => {
  if (!isBroken) {
    const ped = PlayerPedId();
    await Util.loadAnimDict(LOCKPICK_ANIM.animDict);
    TaskPlayAnim(ped, LOCKPICK_ANIM.animDict, LOCKPICK_ANIM.anim, 1, 2, -1, 17, 0, false, false, false);
    const keygameSequence = generateKeygameSequence();
    const keygameSuccess = await Minigames.keygameCustom(keygameSequence);
    StopAnimTask(ped, LOCKPICK_ANIM.animDict, LOCKPICK_ANIM.anim, 1);
    RemoveAnimDict(LOCKPICK_ANIM.animDict);

    if (!keygameSuccess) {
      if (Util.getRndInteger(0, 100) < 20) {
        Inventory.removeItemByNameFromPlayer('lockpick');
      } else {
        Notifications.add('Je bent uitgeschoven', 'error');
        Police.addBloodDrop();
      }
      Events.emitNet('storerobbery:registers:canceled', locationManager.currentStore, registerIdx);
      return;
    }
  }

  const robTime = isBroken ? 40000 : 20000;
  doRobAnimation(robTime);
  const [canceled] = await Taskbar.create('cash-register', 'Kassa beroven...', robTime, {
    canCancel: true,
    cancelOnDeath: true,
    disarm: true,
    disableInventory: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });

  if (canceled) {
    cancelRobAnim = true;
    Events.emitNet('storerobbery:registers:canceled', locationManager.currentStore, registerIdx);
    return;
  }

  Events.emitNet('storerobbery:registers:rob', locationManager.currentStore, registerIdx);
};

const doRobAnimation = async (time: number) => {
  const ped = PlayerPedId();
  await Util.loadAnimDict('oddjobs@shop_robbery@rob_till');
  let robAnimTime = time - 1000; // accounts for exit anim
  TaskPlayAnim(ped, 'oddjobs@shop_robbery@rob_till', 'loop', 2.0, 2.0, -1, 16, 0, false, false, false);
  cancelRobAnim = false;

  const interval = setInterval(() => {
    if (robAnimTime <= 0 || cancelRobAnim) {
      cancelRobAnim = true;
      clearInterval(interval);
      TaskPlayAnim(ped, 'oddjobs@shop_robbery@rob_till', 'exit', 2.0, 2.0, -1, 16, 0, false, false, false);
      RemoveAnimDict('oddjobs@shop_robbery@rob_till');
      return;
    }

    TaskPlayAnim(ped, 'oddjobs@shop_robbery@rob_till', 'loop', 2.0, 2.0, -1, 16, 0, false, false, false);
    robAnimTime -= 1650;
  }, 1650);
};
