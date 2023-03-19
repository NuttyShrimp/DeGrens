import { Events, Notifications, Peek, RPC, Util } from '@dgx/client';
import { TROLLEY_OBJECTS } from '../../shared/constants.trolleys';

Peek.addFlagEntry('heistTrolleyType', {
  options: [
    {
      icon: 'fas fa-sack',
      label: 'Nemen',
      action: (_, entity) => {
        if (!entity) return;
        lootTrolley(entity);
      },
    },
  ],
  distance: 1.5,
});

const lootTrolley = async (trolley: number) => {
  const canLoot = await RPC.execute<boolean>('heists:trolleys:startLooting', NetworkGetNetworkIdFromEntity(trolley));
  if (!canLoot) {
    Notifications.add('Je kan dit momenteel niet', 'error');
    return;
  }

  const trolleyType = (Entity(trolley).state.heistTrolleyType as Heists.Trolley.Type) ?? 'cash';

  global.exports['dg-lib'].shouldExecuteKeyMaps(false);

  const plyPed = PlayerPedId();
  const plyCoords = Util.getPlyCoords();
  const trolleyCoords = Util.getEntityCoords(trolley);
  const trolleyRotation = Util.getEntityRotation(trolley);

  const animDict = 'anim@heists@ornate_bank@grab_cash';

  await Promise.all([Util.requestEntityControl(trolley), Util.loadAnimDict(animDict)]);

  // animation intro
  const { entity: bagObject } = await Util.createObjectOnServer('hei_p_m_bag_var22_arm_s', plyCoords);
  if (!bagObject) {
    console.log('failed to create bagobject');
    global.exports['dg-lib'].shouldExecuteKeyMaps(true);
    return;
  }

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
  await Util.Delay(1500);

  // handles the object in hand
  setImmediate(async () => {
    const pickupHash = TROLLEY_OBJECTS[trolleyType].pickup;
    const { entity: pickupObject } = await Util.createObjectOnServer(pickupHash, plyCoords);
    if (!pickupObject) return;

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

    const startTime = GetGameTimer();
    const appearEvent = GetHashKey('CASH_APPEAR');
    const destroyEvent = GetHashKey('RELEASE_CASH_DESTROY');
    while (GetGameTimer() - startTime < 36900) {
      await Util.Delay(1);
      if (HasAnimEventFired(plyPed, appearEvent) && !IsEntityVisible(pickupObject))
        SetEntityVisible(pickupObject, true, false);
      if (HasAnimEventFired(plyPed, destroyEvent) && IsEntityVisible(pickupObject))
        SetEntityVisible(pickupObject, false, false);
    }
    Util.deleteEntity(pickupObject);
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
  NetworkAddEntityToSynchronisedScene(trolley, animScene, animDict, 'cart_cash_dissapear', 1000.0, -4.0, 1);
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
  Util.deleteEntity(bagObject);
  RemoveAnimDict(animDict);

  global.exports['dg-lib'].shouldExecuteKeyMaps(true);

  Events.emitNet('heists:trolleys:finishLooting', NetworkGetNetworkIdFromEntity(trolley));
};
