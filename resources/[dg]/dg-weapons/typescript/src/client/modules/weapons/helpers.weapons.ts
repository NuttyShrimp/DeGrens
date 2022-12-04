import { Events, Inventory, Jobs, RPC, Util } from '@dgx/client';
import { setCurrentWeaponTint } from 'services/tint';
import { getCurrentWeaponData, setCurrentWeaponData } from './service.weapons';

const setWeapon = async (itemId: string, weaponHash: number, tint?: string) => {
  Inventory.toggleObject(itemId, false);
  const ped = PlayerPedId();
  SetCurrentPedWeapon(ped, weaponHash, true);

  const components = await RPC.execute<string[]>('weapons:server:getWeaponAttachments', itemId);
  (components ?? []).forEach(comp => GiveWeaponComponentToPed(ped, weaponHash, comp));

  if (tint !== undefined) {
    setCurrentWeaponTint(itemId, weaponHash, tint);
  }
};

const removeWeapon = (itemId: string) => {
  Inventory.toggleObject(itemId, true);
  SetCurrentPedWeapon(PlayerPedId(), GetHashKey('WEAPON_UNARMED'), true);
  Events.emitNet('weapons:server:removeWeapon');
};

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

export const forceRemoveWeapon = async (itemId?: string, skipAnimation?: boolean) => {
  const currentWeaponData = getCurrentWeaponData();
  if (currentWeaponData === null) return;

  if (itemId === undefined || currentWeaponData.id === itemId) {
    RemoveAllPedWeapons(PlayerPedId(), true);
    if (skipAnimation) {
      removeWeapon(currentWeaponData.id);
    } else {
      await holsterWeapon(currentWeaponData);
    }
    setCurrentWeaponData(null);
  }
};
