import { PolyZone, Notifications, Util, RPC, Taskbar, Events, Inventory } from '@dgx/client';

let powerStations: PowerstationData[] = [];
let currentStation: number = null;
let explosiveObject: number;
let placingExplosive = false;

PolyZone.onEnter<{ id: number }>('blackout_powerstation', (name: string, data: { id: number }) => {
  currentStation = data.id;
});
PolyZone.onLeave('blackout_powerstation', () => {
  currentStation = null;
});

Events.onNet('blackout:client:useExplosive', async () => {
  const isHit = await RPC.execute<boolean>('blackout:server:isStationHit', currentStation);
  if (currentStation === null || isHit) {
    Notifications.add('Je kan hier niks exploderen.', 'error');
    return;
  }
  if (IsPedInAnyVehicle(PlayerPedId(), true)) {
    Notifications.add('Je kan dit niet vanuit een voertuig.', 'error');
    return;
  }
  plantExplosive(currentStation);
});

Events.onNet('blackout:server:getPowerStations', (data: PowerstationData[]) => {
  powerStations = data;
  powerStations.forEach((zone, id) => {
    const options = { ...zone.options, data: { id: id } };
    PolyZone.addBoxZone('blackout_powerstation', zone.center, zone.width, zone.length, options, true);
  });
});

const plantExplosive = async (stationId: number) => {
  if (placingExplosive) return;
  placingExplosive = true;

  const [wasCanceled, _percentage] = await Taskbar.create('bomb', 'Explosief plaatsen...', 5000, {
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

  const removedItem = await Inventory.removeItemFromPlayer('big_explosive');
  if (wasCanceled || !removedItem) {
    placingExplosive = false;
    return;
  }

  placeExplosiveObject();
  await Util.Delay(10000);
  const coords = powerStations[stationId].center;
  AddExplosion(coords.x, coords.y, coords.z, 82, 1.0, true, false, 1.0);
  removeExplosiveObject();

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

  Events.emitNet('blackout:server:setStationHit', stationId);
  placingExplosive = false;
};

const placeExplosiveObject = async () => {
  const modelHash = GetHashKey('prop_ld_bomb');
  RequestModel(modelHash);
  while (!HasModelLoaded(modelHash)) {
    await Util.Delay(10);
  }

  const objCoords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0, 0.65, 0));
  explosiveObject = CreateObject(modelHash, objCoords.x, objCoords.y, objCoords.z, true, true, false);
  while (!DoesEntityExist) {
    await Util.Delay(10);
  }

  PlaceObjectOnGroundProperly(explosiveObject);
  const rotation = Util.ArrayToVector3(GetEntityRotation(explosiveObject, 2));
  SetEntityRotation(explosiveObject, rotation.x - 90.0, rotation.y, rotation.z, 2, true);
  const coords = Util.getEntityCoords(explosiveObject);
  SetEntityCoords(explosiveObject, coords.x, coords.y, coords.z - 0.1, false, false, false, false);
  FreezeEntityPosition(explosiveObject, true);

  global.exports['nutty-sounds'].playSoundOnEntity(
    'explosionBeep',
    'Explosion_Countdown',
    'GTAO_FM_Events_Soundset',
    explosiveObject
  );
};

const removeExplosiveObject = () => {
  if (explosiveObject === null) return;
  global.exports['nutty-sounds'].stopSoundOnEntity('explosionBeep');
  DeleteEntity(explosiveObject);
  explosiveObject = null;
};
