import { Particles, Util } from '@dgx/client';

export const playOpeningAnim = async () => {
  const ped = PlayerPedId();
  const rotation = Util.getEntityRotation(ped);

  const ANIM_DICT = 'anim@scripted@player@mission@tunf_train_ig1_container_p1@male@';
  await Util.loadAnimDict(ANIM_DICT);

  const objCoords = Util.getEntityCoords(ped).add({ x: 0, y: 0, z: -3 });
  const [spawnedGrinderObject, spawnedBagObject] = await Promise.all([
    Util.createObjectOnServer('tr_prop_tr_grinder_01a', objCoords),
    Util.createObjectOnServer('hei_p_m_bag_var22_arm_s', objCoords),
  ]);

  if (!spawnedGrinderObject || !spawnedBagObject) {
    RemoveAnimDict(ANIM_DICT);
    return;
  }

  global.exports['dg-lib'].shouldExecuteKeyMaps(false);

  const { x, y, z } = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(ped, 0.0, 2.2, -1.0));
  const { x: rx, y: ry, z: rz } = rotation;

  const scene = NetworkCreateSynchronisedScene(x, y, z, rx, ry, rz, 2, true, false, 1065353216, 0, 1065353216);
  NetworkAddPedToSynchronisedScene(ped, scene, ANIM_DICT, 'action', 4.0, -4.0, 1033, 0, 1000.0, 0);
  NetworkAddEntityToSynchronisedScene(
    spawnedGrinderObject.entity,
    scene,
    ANIM_DICT,
    'action_angle_grinder',
    1.0,
    -1.0,
    1148846080
  );
  NetworkAddEntityToSynchronisedScene(spawnedBagObject.entity, scene, ANIM_DICT, 'action_bag', 1.0, -1.0, 1148846080);
  NetworkStartSynchronisedScene(scene);

  setTimeout(() => {
    const ptfx = Particles.add({
      dict: 'scr_tn_tr',
      name: 'scr_tn_tr_angle_grinder_sparks',
      looped: true,
      netId: spawnedGrinderObject.netId,
      offset: { x: 0, y: 0.25, z: 0 },
    });

    setTimeout(() => {
      Particles.remove(ptfx);
    }, 1200);
  }, 4000);

  await Util.Delay(7900);

  Util.deleteEntity(spawnedBagObject.entity);
  Util.deleteEntity(spawnedGrinderObject.entity);

  NetworkStopSynchronisedScene(scene);
  RemoveAnimDict(ANIM_DICT);

  global.exports['dg-lib'].shouldExecuteKeyMaps(true);
};
