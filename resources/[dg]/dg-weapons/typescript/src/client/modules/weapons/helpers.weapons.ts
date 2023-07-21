import { Events, Jobs, Util } from '@dgx/client';
import { getCurrentWeaponData, setAnimationBusy, setCurrentWeaponData } from './service.weapons';

const setWeapon = (itemId: string) => {
  Events.emitNet('weapons:setWeapon', itemId);
};

const removeWeapon = (itemId: string) => {
  Events.emitNet('weapons:removeWeapon', itemId);
};

export const holsterWeapon = async (weaponData: Weapons.WeaponItem) => {
  if (weaponData.noHolstering) {
    removeWeapon(weaponData.id);
    return;
  }

  const ped = PlayerPedId();
  const blockInterval = startBlockShootingInterval();

  const pedCoords = Util.getPlyCoords();
  setAnimationBusy(true);
  if (doFastAnimation()) {
    await Util.loadAnimDict('reaction@intimidation@cop@unarmed');
    TaskPlayAnimAdvanced(
      ped,
      'reaction@intimidation@cop@unarmed',
      'intro',
      pedCoords.x,
      pedCoords.y,
      pedCoords.z,
      0,
      0,
      GetEntityHeading(ped),
      3.0,
      3.0,
      -1,
      50,
      0,
      0,
      0
    );
    await Util.Delay(500);
    StopAnimTask(ped, 'reaction@intimidation@cop@unarmed', 'intro', 1.0);
  } else {
    await Util.loadAnimDict('reaction@intimidation@1h');
    TaskPlayAnimAdvanced(
      ped,
      'reaction@intimidation@1h',
      'outro',
      pedCoords.x,
      pedCoords.y,
      pedCoords.z,
      0,
      0,
      GetEntityHeading(ped),
      8.0,
      3.0,
      -1,
      50,
      0,
      0,
      0
    );
    await Util.Delay(1400);
    StopAnimTask(ped, 'reaction@intimidation@1h', 'outro', 1.0);
  }

  removeWeapon(weaponData.id);
  clearInterval(blockInterval);
  setAnimationBusy(false);
};

export const unholsterWeapon = async (weaponData: Weapons.WeaponItem) => {
  if (weaponData.noHolstering) {
    setWeapon(weaponData.id);
    return;
  }

  const ped = PlayerPedId();
  const blockInterval = startBlockShootingInterval();

  const pedCoords = Util.getPlyCoords();
  setAnimationBusy(true);
  if (doFastAnimation()) {
    await Util.loadAnimDict('rcmjosh4');
    TaskPlayAnimAdvanced(
      ped,
      'rcmjosh4',
      'josh_leadout_cop2',
      pedCoords.x,
      pedCoords.y,
      pedCoords.z,
      0,
      0,
      GetEntityHeading(ped),
      3.0,
      3.0,
      -1,
      50,
      0,
      0,
      0
    );
    await Util.Delay(300);
    setWeapon(weaponData.id);
    await Util.Delay(300);
    StopAnimTask(ped, 'rcmjosh4', 'josh_leadout_cop2', 1.0);
  } else {
    await Util.loadAnimDict('reaction@intimidation@1h');
    TaskPlayAnimAdvanced(
      ped,
      'reaction@intimidation@1h',
      'intro',
      pedCoords.x,
      pedCoords.y,
      pedCoords.z,
      0,
      0,
      GetEntityHeading(ped),
      8.0,
      3.0,
      -1,
      50,
      0,
      0,
      0
    );
    await Util.Delay(1000);
    setWeapon(weaponData.id);
    await Util.Delay(1400);
    StopAnimTask(ped, 'reaction@intimidation@1h', 'intro', 1.0);
  }

  clearInterval(blockInterval);
  setAnimationBusy(false);
};

const doFastAnimation = () => {
  return Jobs.getCurrentJob().name === 'police';
};

const startBlockShootingInterval = () => {
  const interval = setInterval(() => {
    DisableControlAction(0, 25, true);
    DisableControlAction(0, 68, true);
    DisableControlAction(0, 91, true);
    DisablePlayerFiring(PlayerPedId(), true);
  }, 1);
  return interval;
};

export const forceRemoveWeapon = async (itemId?: string, skipAnimation?: boolean) => {
  const currentWeaponData = getCurrentWeaponData();
  if (currentWeaponData === null) return;

  if (itemId == undefined || currentWeaponData.id === itemId) {
    if (skipAnimation) {
      removeWeapon(currentWeaponData.id);
    } else {
      await holsterWeapon(currentWeaponData);
    }
    setCurrentWeaponData(null);
  }
};
