import { Inventory, Jobs, RPC, Util } from '@dgx/client';
import { getCurrentWeaponData, setCurrentWeaponData } from 'services/equipped';
import { TINT_COLOR_NAMES } from '../constants';

export const holsterWeapon = async (weaponData: Weapons.WeaponItem) => {
  if (weaponData.noHolstering) {
    removeWeapon(weaponData.id);
    return;
  }

  const ped = PlayerPedId();
  const blockInterval = startBlockShootingInterval();

  const pedCoords = Util.getPlyCoords();
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
};

export const unholsterWeapon = async (weaponData: Weapons.WeaponItem) => {
  if (weaponData.noHolstering) {
    setWeapon(weaponData.id, weaponData.hash, weaponData.metadata?.tint);
    return;
  }

  const ped = PlayerPedId();
  const blockInterval = startBlockShootingInterval();

  const pedCoords = Util.getPlyCoords();
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
    setWeapon(weaponData.id, weaponData.hash, weaponData.metadata?.tint);
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
    setWeapon(weaponData.id, weaponData.hash, weaponData.metadata?.tint);
    await Util.Delay(1400);
    StopAnimTask(ped, 'reaction@intimidation@1h', 'intro', 1.0);
  }

  clearInterval(blockInterval);
};

const setWeapon = async (itemId: string, weaponHash: number, tint?: string) => {
  Inventory.toggleObject(itemId, false);
  const ped = PlayerPedId();
  SetCurrentPedWeapon(ped, weaponHash, true);

  const components = await RPC.execute<string[]>('weapons:server:getWeaponAttachments', itemId);
  (components ?? []).forEach(comp => GiveWeaponComponentToPed(ped, weaponHash, comp));

  if (tint !== undefined) {
    const tintId = getTintIdOfName(tint);
    if (tintId !== undefined) {
      SetPedWeaponTintIndex(ped, weaponHash, tintId);
    }
  }
};

const removeWeapon = (itemId: string) => {
  Inventory.toggleObject(itemId, true);
  SetCurrentPedWeapon(PlayerPedId(), GetHashKey('WEAPON_UNARMED'), true);
};

const getTintIdOfName = (tintName: string) => {
  for (const [id, name] of Object.entries(TINT_COLOR_NAMES)) {
    if (name !== tintName) continue;
    return Number(id);
  }
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

export const showReticle = (show: boolean) => {
  SendNUIMessage({
    action: 'showReticle',
    show,
  });
};

export const forceRemoveWeapon = (itemId?: string, skipAnimation?: boolean) => {
  const currentWeaponData = getCurrentWeaponData();
  if (currentWeaponData === null) return;

  if (itemId === undefined || currentWeaponData.id === itemId) {
    RemoveAllPedWeapons(PlayerPedId(), true);
    if (skipAnimation) {
      removeWeapon(currentWeaponData.id);
    } else {
      holsterWeapon(currentWeaponData);
    }
    setCurrentWeaponData(null);
  }
};
