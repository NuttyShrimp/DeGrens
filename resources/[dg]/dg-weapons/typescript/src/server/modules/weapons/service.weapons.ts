import { Events, Inventory, Util } from '@dgx/server';
import { getConfig, getWeaponConfig } from 'services/config';
import { mainLogger } from 'sv_logger';
import { UNARMED_HASH } from './constants.weapons';
import { DEFAULT_SHARED_WEAPON_CONFIG } from 'contants';

const equippedWeapons: Map<number, Weapons.EquippedData> = new Map();

export const initiateEquippedPlayerWeapon = (plyId: number) => {
  const equippedData: Weapons.EquippedData = {
    removeTimeout: null,
    weaponHash: UNARMED_HASH,
  };
  equippedWeapons.set(plyId, equippedData);
  return equippedData;
};

// Get equippedData and iniatiate if not set
export const getEquippedData = (plyId: number): Weapons.EquippedData => {
  const equippedData = equippedWeapons.get(plyId);
  if (!equippedData) {
    const logMsg = `${Util.getName(plyId)} did not have a weapon registered to him (Should default to UNARMED)`;
    Util.Log('weapons:noWeaponRegistered', {}, logMsg, plyId, true);
    mainLogger.error(logMsg);
    return initiateEquippedPlayerWeapon(plyId);
  }
  return equippedData;
};

export const setEquippedWeapon = (plyId: number, weaponHash: number) => {
  const equippedData = getEquippedData(plyId);
  if (equippedData.removeTimeout) {
    clearTimeout(equippedData.removeTimeout);
    equippedData.removeTimeout = null;
  }
  equippedData.weaponHash = weaponHash;

  const logMsg = `${Util.getName(plyId)} has equipped a weapon (${weaponHash})`;
  Util.Log('weapons:equip', { weaponHash }, logMsg, plyId);
  mainLogger.silly(logMsg);
};

// setcurrentpedweapon being an rpc native has a latency (tested 100ms).
// if anticheat checks during the latency, ped will still have weapon but script will say it should be unarmed
// Thats why we allow a 2 sec grace period
export const removeEquippedWeapon = (plyId: number) => {
  const equippedData = getEquippedData(plyId);
  const prevWeapon = equippedData.weaponHash;
  equippedData.removeTimeout = setTimeout(() => {
    equippedData.weaponHash = UNARMED_HASH;
  }, 2000);

  const logMsg = `${Util.getName(plyId)} has unequipped his weapon (${prevWeapon})`;
  Util.Log('weapons:unequip', { weaponHash: prevWeapon }, logMsg, plyId);
  mainLogger.silly(logMsg);
};

export const registerUseableWeapons = () => {
  const weaponNames = Object.values(getConfig().weapons).map(w => w.name);

  Inventory.registerUseable(weaponNames, (src, itemState) => {
    const weaponConfig = getWeaponConfig(itemState.name);
    if (!weaponConfig) return;

    const weaponData: Weapons.WeaponItem = {
      ...itemState,
      ...DEFAULT_SHARED_WEAPON_CONFIG,
      ...weaponConfig,
      hash: GetHashKey(itemState.name) >>> 0,
    };

    Events.emitNet('weapons:client:useWeapon', src, weaponData);
  });
};

export const getWeaponItemState = (itemId: string) => {
  const itemState = Inventory.getItemStateById<Weapons.WeaponItemMetadata>(itemId);
  if (!itemState) {
    mainLogger.error(`Could not find weaponitem with id ${itemId}`);
    Util.Log('weapons:couldNotFindItem', { itemId }, `Could not find weaponitem with id ${itemId}`, undefined, true);
    return;
  }
  return itemState;
};
