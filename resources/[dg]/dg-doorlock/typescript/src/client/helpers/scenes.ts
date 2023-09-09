import { Util } from '@dgx/client';
import { getDoorId } from './doors';
import { Vector3 } from '@dgx/shared';

export const findAnimScenePositionForDoor = (doorEntity: number, raycastHitCoords: Vec3): Vec4 | undefined => {
  const plyCoords = Util.getPlyCoords();
  const doorCoords: Vec4 = { ...Util.getEntityCoords(doorEntity), w: GetEntityHeading(doorEntity) };
  if (plyCoords.distance(doorCoords) > 2) return;

  const doorId = getDoorId(doorEntity);
  if (doorId === undefined) return;

  const [doorMinSize, doorMaxSize] = GetModelDimensions(GetEntityModel(doorEntity));
  const width = doorMaxSize[0] - doorMinSize[0];
  const depth = doorMaxSize[1] - doorMinSize[1];

  const XSides: Vec3[] = [
    Util.getOffsetFromCoords(doorCoords, { x: width - 0.2, y: 0, z: 0 }),
    Util.getOffsetFromCoords(doorCoords, { x: -(width - 0.2), y: 0, z: 0 }),
  ];

  let closestXDist = width;
  let closestXSide: Vec4 | undefined;
  for (let i = 0; i < XSides.length; i++) {
    const dist = plyCoords.distance(XSides[i]);
    if (dist < closestXDist) {
      closestXDist = dist;
      closestXSide = { ...XSides[i], w: doorCoords.w };
    }
  }
  if (!closestXSide) return;

  // make sure we dont stand at wrong side while aiming at other side of door
  if (Vector3.create(raycastHitCoords).distance(closestXSide) > width) return;

  const YSides = [
    Util.getOffsetFromCoords(closestXSide, { x: 0, y: depth * 0.4, z: 0 }),
    Util.getOffsetFromCoords(closestXSide, { x: 0, y: -depth * 0.4, z: 0 }),
  ];

  let scenePosition = YSides[0];
  const distanceToFront = plyCoords.distance(scenePosition);
  if (distanceToFront > plyCoords.distance(YSides[1])) {
    scenePosition = YSides[1];
  }

  const heading = Util.getHeadingToFaceCoordsFromCoord(scenePosition, closestXSide);
  return { ...scenePosition, z: plyCoords.z, w: heading };
};

export const doThermiteOnDoorAnimScene = async (position: Vec4) => {
  // disable keybinds during anim
  global.exports['dg-lib'].shouldExecuteKeyMaps(false);

  await Util.loadAnimDict('anim@heists@ornate_bank@thermal_charge');

  const ped = PlayerPedId();
  const rotation = Util.ArrayToVector3(GetEntityRotation(ped, 0));
  const scene = NetworkCreateSynchronisedScene(
    position.x,
    position.y,
    position.z,
    rotation.x,
    rotation.y,
    position.w,
    2,
    false,
    false,
    1065353216,
    0,
    1.3
  );

  const spawnedBagObject = await Util.createObjectOnServer('hei_p_m_bag_var22_arm_s', {
    ...position,
    z: position.z - 3,
  });
  if (!spawnedBagObject) {
    console.log('Failed to create bagObject');
    global.exports['dg-lib'].shouldExecuteKeyMaps(true);
    return;
  }

  const bagObject = spawnedBagObject.entity;
  SetEntityCollision(bagObject, false, true);
  NetworkAddPedToSynchronisedScene(
    ped,
    scene,
    'anim@heists@ornate_bank@thermal_charge',
    'thermal_charge',
    1.5,
    -4.0,
    1,
    16,
    1148846080,
    0
  );
  NetworkAddEntityToSynchronisedScene(
    bagObject,
    scene,
    'anim@heists@ornate_bank@thermal_charge',
    'bag_thermal_charge',
    4.0,
    -8.0,
    1
  );
  NetworkStartSynchronisedScene(scene);

  await Util.Delay(1500);

  const spawnedThermiteObject = await Util.createObjectOnServer('hei_prop_heist_thermite', {
    ...position,
    z: position.z - 3,
  });
  if (!spawnedThermiteObject) {
    console.log('Failed to create thermiteObject');
    global.exports['dg-lib'].shouldExecuteKeyMaps(true);
    return;
  }

  const thermiteObject = spawnedThermiteObject.entity;
  SetEntityCollision(thermiteObject, false, true);
  AttachEntityToEntity(
    thermiteObject,
    ped,
    GetPedBoneIndex(ped, 28422),
    0,
    0,
    0,
    0,
    0,
    200.0,
    true,
    true,
    false,
    true,
    1,
    true
  );
  await Util.Delay(4000);

  Util.deleteEntity(bagObject);
  DetachEntity(thermiteObject, true, true);
  FreezeEntityPosition(thermiteObject, true);
  ClearPedTasks(ped);
  NetworkStopSynchronisedScene(scene);

  global.exports['dg-lib'].shouldExecuteKeyMaps(true);

  return thermiteObject;
};
