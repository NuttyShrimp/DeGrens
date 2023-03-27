import { Events, Inventory, Notifications, Police, RPC, Util } from '@dgx/server';
import { getWeaponAmmo, saveWeaponAmmo } from 'modules/ammo/service.ammo';
import { getWeaponAttachments } from 'modules/attachments/service.attachments';
import { getWeaponConfig } from 'services/config';
import { applyWeaponTint } from 'services/tint';
import {
  getEquippedData,
  getWeaponItemState,
  initiateEquippedPlayerWeapon,
  removeEquippedWeapon,
  setEquippedWeapon,
} from './service.weapons';
import { UNARMED_HASH } from './constants.weapons';

// Give weapon to ped and set attachments/tint
Events.onNet('weapons:setWeapon', async (src: number, itemId: string) => {
  const cid = Util.getCID(src);
  const item = getWeaponItemState(itemId);
  if (!item) return; // Can happen if item breaks this exact moment
  if (item.inventory !== Inventory.concatId('player', cid)) return; // Can happen if item gets removed during animation
  Events.emitNet('auth:anticheat:weaponDrawn', src);

  const weaponHash = GetHashKey(item.name) >>> 0;
  const ped = GetPlayerPed(String(src));
  const ammo = getWeaponAmmo(item);
  GiveWeaponToPed(ped, weaponHash, ammo, false, true);
  setEquippedWeapon(src, weaponHash);
  Inventory.toggleObject(src, itemId, false);

  const components = await getWeaponAttachments(itemId);
  (components ?? []).forEach(comp => GiveWeaponComponentToPed(ped, weaponHash, comp));

  const tint = item.metadata?.tint as string;
  if (tint !== undefined) {
    applyWeaponTint(src, tint);
  }
});

// Remove weapon from ped
Events.onNet('weapons:removeWeapon', async (src: number, itemId: string) => {
  const ped = GetPlayerPed(String(src));

  RemoveAllPedWeapons(ped, true);
  removeEquippedWeapon(src);
  SetCurrentPedWeapon(ped, UNARMED_HASH, true);
  Events.emitNet('auth:anticheat:weaponRemoved', src);
  Inventory.toggleObject(src, itemId, true);
});

Events.onNet(
  'weapons:server:stoppedShooting',
  (src: number, itemId: string, ammoCount: number, shotFirePositions: Vec3[]) => {
    const itemState = getWeaponItemState(itemId);
    if (!itemState) return;

    const weaponConfig = getWeaponConfig(itemState.name);
    if (!weaponConfig) return;

    if (weaponConfig.oneTimeUse) {
      Inventory.destroyItem(itemId);
      return;
    }

    // We decrease quality based on amount of shots fired
    const decrease = weaponConfig.durabilityMultiplier * shotFirePositions.length;
    Inventory.setQualityOfItem(itemId, old => old - decrease);
    saveWeaponAmmo(src, itemId, ammoCount);

    Police.addBulletCasings(src, itemState, shotFirePositions);
  }
);

Events.onNet('weapons:server:meleeHit', (plyId: number, itemId: string, hits: number) => {
  const itemState = getWeaponItemState(itemId);
  if (!itemState) return;

  const weaponConfig = getWeaponConfig(itemState.name);
  if (!weaponConfig) return;

  const decrease = weaponConfig.durabilityMultiplier * hits;
  Inventory.setQualityOfItem(itemId, old => old - decrease);
});

Inventory.onInventoryUpdate(
  'player',
  (identifier, _, itemState) => {
    const weaponConfig = getWeaponConfig(itemState.name, true);
    if (!weaponConfig) return;
    if (weaponConfig.oneTimeUse) return;

    const targetId = DGCore.Functions.getPlyIdForCid(Number(identifier));
    if (!targetId) return;
    Events.emitNet('weapons:client:removeWeapon', targetId, itemState.id);
  },
  undefined,
  'remove'
);

on('playerJoining', () => {
  initiateEquippedPlayerWeapon(source);
});

on('onResourceStart', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  Util.getAllPlayers().forEach(plyId => {
    initiateEquippedPlayerWeapon(plyId);
  });
});

on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  Events.emitNet('auth:anticheat:weaponRemoved', -1);
});

global.exports('forceSetQuality', async (plyId: number, quality: number) => {
  const weaponId = await RPC.execute<string | null>('weapons:client:getCurrentWeaponId', plyId);
  if (!weaponId) {
    Notifications.add(plyId, 'Je hebt geen wapen vast', 'error');
    return;
  }
  Inventory.setQualityOfItem(weaponId, () => quality);
  Util.Log(
    'weapons:forceSetQuality',
    { itemId: weaponId, quality },
    `Quality of weaponitem ${weaponId} has been force set to ${quality}`
  );
});

global.exports('getPlayerEquippedWeapon', (plyId: number) => {
  return getEquippedData(plyId).weaponHash;
});

Events.onNet('weapons:server:firstShot', (plyId: number) => {
  const coords = Util.getPlyCoords(plyId)
  Police.createDispatchCall({
    tag: '10-71',
    title: 'Schotmelding',
    description: 'Een wandelaar meldt het horen van een schot',
    coords: coords,
    criminal: plyId,
    blip: {
      sprite: 110,
      color: 0,
    },
  });
});