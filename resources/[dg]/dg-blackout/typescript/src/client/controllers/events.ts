import { Events, PolyZone, Inventory, Notifications, Sounds, Taskbar, Util } from '@dgx/client';
import blackoutManager from 'classes/BlackoutManager';

let placingExplosive = false;

Events.onNet('blackout:client:init', (powerstations: Blackout.Powerstation[], safezones: Blackout.Safezone[]) => {
  powerstations.forEach((zone, id) => {
    PolyZone.addBoxZone('blackout_powerstation', zone.center, zone.width, zone.length, {
      ...zone.options,
      data: { id },
    });
  });

  safezones.forEach(zone => {
    PolyZone.addPolyZone('blackout_safezone', zone.vectors, zone.options);
  });
});

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() != resourceName) return;
  blackoutManager.loadStateBag({
    blackout: false,
    safezones: false,
  });
});

AddStateBagChangeHandler('blackoutState', 'global', (bagName: string, keyName: string, state: Blackout.Statebag) => {
  if (bagName !== 'global') return;
  if (keyName !== 'blackoutState') return;
  blackoutManager.loadStateBag(state);
});

onNet('blackout:flicker', () => {
  blackoutManager.flicker();
});

Events.onNet('blackout:powerstation:useExplosive', async (stationId: number) => {
  if (placingExplosive) {
    Notifications.add('Je bent al een explosief aan het plaatsen', 'error');
    return;
  }

  placingExplosive = true;

  const [wasCanceled, _percentage] = await Taskbar.create('bomb', 'Explosief plaatsen', 25000, {
    canCancel: true,
    cancelOnDeath: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      combat: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 0,
    },
  });
  if (wasCanceled) {
    placingExplosive = false;
    return;
  }

  const explosiveCoords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0, 0.65, -0.8));
  const { entity: explosiveObject } = await Util.createObjectOnServer('prop_ld_bomb', explosiveCoords);
  if (!explosiveObject) {
    placingExplosive = false;
    return;
  }

  const removedItem = await Inventory.removeItemByNameFromPlayer('big_explosive');
  if (!removedItem) {
    placingExplosive = false;
    return;
  }

  PlaceObjectOnGroundProperly(explosiveObject);
  const rotation = Util.getEntityRotation(explosiveObject);
  SetEntityRotation(explosiveObject, rotation.x - 90, rotation.y, rotation.z, 2, true);
  const coords = Util.getEntityCoords(explosiveObject);
  SetEntityCoords(explosiveObject, coords.x, coords.y, coords.z - 0.1, false, false, false, false);
  FreezeEntityPosition(explosiveObject, true);

  const soundId = `explosionBeep_${Math.round(Date.now() / 1000)}`;
  Sounds.playOnEntity(soundId, 'Explosion_Countdown', 'GTAO_FM_Events_Soundset', explosiveObject);
  await Util.Delay(10000);

  AddExplosion(coords.x, coords.y, coords.z, 82, 1.0, true, false, 1.0);
  Sounds.stop(soundId);
  Util.deleteEntity(explosiveObject);

  Events.emitNet('blackout:powerstation:setHit', stationId);
  placingExplosive = false;

  await Util.Delay(900);
  AddExplosion(
    coords.x + Util.getRndInteger(0, 5),
    coords.y + Util.getRndInteger(0, 5),
    coords.z,
    82,
    1.0,
    true,
    false,
    1.0
  );
  await Util.Delay(1200);
  AddExplosion(
    coords.x + Util.getRndInteger(0, 8),
    coords.y + Util.getRndInteger(0, 8),
    coords.z,
    82,
    1.0,
    true,
    false,
    1.0
  );
});
