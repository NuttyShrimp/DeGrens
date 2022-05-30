import { Events, Util } from '@dgx/client';
import { getCurrentLocation } from 'controllers/locations';
import { TROLLEY_LOCATIONS, TROLLEY_OBJECTS } from './constants.trolleys';

export const spawnTrolleys = async (heistId: Heist.Id) => {
  if (!TROLLEY_LOCATIONS[heistId]) return;
  TROLLEY_LOCATIONS[heistId].forEach(async trolley => {
    if (Util.getRndInteger(0, 100) > trolley.spawnChance) return;
    const trolleyHash = TROLLEY_OBJECTS[trolley.type].trolley;
    await Util.loadModel(trolleyHash);
    const trolleyObject = CreateObject(
      trolleyHash,
      trolley.coords.x,
      trolley.coords.y,
      trolley.coords.z,
      true,
      true,
      false
    );
    SetEntityHeading(trolleyObject, trolley.coords.w);
    PlaceObjectOnGroundProperly(trolleyObject);
    FreezeEntityPosition(trolleyObject, true);
    SetModelAsNoLongerNeeded(trolleyHash);
    Entity(trolleyObject).state.set('canBeLooted', true, true);
    await Util.Delay(50);
  });
};

export const lootTrolley = async (trolleyObject: number) => {
  const type = getTrolleyTypeFromEntity(trolleyObject);
  if (!type) return;
  global.exports['dg-lib'].shouldExecuteKeyMaps(false);

  const plyPed = PlayerPedId();
  const plyCoords = Util.getPlyCoords();
  const trolleyCoords = Util.getEntityCoords(trolleyObject);
  const trolleyRotation = Util.getEntityRotation(trolleyObject);
  SetEntityAsMissionEntity(trolleyObject, true, true);
  await Util.requestEntityControl(trolleyObject);
  const animDict = 'anim@heists@ornate_bank@grab_cash';
  await Util.loadAnimDict(animDict);
  const bagHash = GetHashKey('hei_p_m_bag_var22_arm_s');
  await Util.loadModel(bagHash);

  // animation intro
  const bagObject = CreateObject(bagHash, plyCoords.x, plyCoords.y, plyCoords.z, true, false, false);
  let animScene = NetworkCreateSynchronisedScene(
    trolleyCoords.x,
    trolleyCoords.y,
    trolleyCoords.z,
    trolleyRotation.x,
    trolleyRotation.y,
    trolleyRotation.z,
    2,
    false,
    false,
    1065353216,
    0,
    1.3
  );
  NetworkAddPedToSynchronisedScene(plyPed, animScene, animDict, 'intro', 1.5, -4.0, 1, 16, 1148846080, 0);
  NetworkAddEntityToSynchronisedScene(bagObject, animScene, animDict, 'bag_intro', 4.0, -8.0, 1);
  NetworkStartSynchronisedScene(animScene);
  SetModelAsNoLongerNeeded(bagHash);
  await Util.Delay(1500);

  // handles the object in hand
  setImmediate(async () => {
    const pickupHash = TROLLEY_OBJECTS[type].pickup;
    await Util.loadModel(pickupHash);
    const pickupObject = CreateObject(pickupHash, plyCoords.x, plyCoords.y, plyCoords.z, true, false, false);
    FreezeEntityPosition(pickupObject, true);
    SetEntityInvincible(pickupObject, true);
    SetEntityNoCollisionEntity(pickupObject, plyPed, false);
    SetEntityVisible(pickupObject, false, false);
    AttachEntityToEntity(
      pickupObject,
      plyPed,
      GetPedBoneIndex(plyPed, 60309),
      0,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      true
    );
    SetModelAsNoLongerNeeded(pickupHash);

    const startTime = GetGameTimer();
    const appearEvent = GetHashKey('CASH_APPEAR');
    const destroyEvent = GetHashKey('RELEASE_CASH_DESTROY');
    while (GetGameTimer() - startTime < 36900) {
      await Util.Delay(1);
      DisableControlAction(0, 73, true); // disable taking cover to not ruin animation
      if (HasAnimEventFired(plyPed, appearEvent) && !IsEntityVisible(pickupObject))
        SetEntityVisible(pickupObject, true, false);
      if (HasAnimEventFired(plyPed, destroyEvent) && IsEntityVisible(pickupObject))
        SetEntityVisible(pickupObject, false, false);
    }
    await Util.requestEntityControl(pickupObject);
    DeleteEntity(pickupObject);
  });

  // grab anim and cart emptying
  animScene = NetworkCreateSynchronisedScene(
    trolleyCoords.x,
    trolleyCoords.y,
    trolleyCoords.z,
    trolleyRotation.x,
    trolleyRotation.y,
    trolleyRotation.z,
    2,
    true,
    false,
    1065353216,
    0,
    1.3
  );
  NetworkAddPedToSynchronisedScene(plyPed, animScene, animDict, 'grab', 1.5, -4.0, 1, 16, 1148846080, 0);
  NetworkAddEntityToSynchronisedScene(bagObject, animScene, animDict, 'bag_grab', 4.0, -8.0, 1);
  NetworkAddEntityToSynchronisedScene(trolleyObject, animScene, animDict, 'cart_cash_dissapear', 1000.0, -4.0, 1);
  NetworkStartSynchronisedScene(animScene);
  await Util.Delay(36900);

  // finish anim
  animScene = NetworkCreateSynchronisedScene(
    trolleyCoords.x,
    trolleyCoords.y,
    trolleyCoords.z,
    trolleyRotation.x,
    trolleyRotation.y,
    trolleyRotation.z,
    2,
    false,
    false,
    1065353216,
    0,
    1.3
  );
  NetworkAddPedToSynchronisedScene(plyPed, animScene, animDict, 'exit', 1.5, -4.0, 1, 16, 1148846080, 0);
  NetworkAddEntityToSynchronisedScene(bagObject, animScene, animDict, 'bag_exit', 1000.0, -4.0, 1);
  NetworkStartSynchronisedScene(animScene);
  await Util.Delay(1800);

  // cleanup
  await Util.requestEntityControl(bagObject);
  DeleteEntity(bagObject);
  RemoveAnimDict(animDict);
  global.exports['dg-lib'].shouldExecuteKeyMaps(true);

  // remove trolley after while
  setTimeout(async () => {
    await Util.requestEntityControl(trolleyObject);
    DeleteEntity(trolleyObject);
  }, 5000);

  Events.emitNet('heists:server:lootTrolley', getCurrentLocation(), type);
};

const getTrolleyTypeFromEntity = (entity: number): Trolley.Type => {
  const model = GetEntityModel(entity);
  let trolleyType: Trolley.Type = 'cash';
  Object.entries(TROLLEY_OBJECTS).forEach(([type, data]) => {
    if (data.trolley === model) trolleyType = type as Trolley.Type;
  });
  return trolleyType;
};
