import { PropAttach, Util } from '@dgx/client';

let tabletPropId: number | null = null;
const animProps = new Set<number>();
const activeAnimations = new Set<string>();

const cleanTabletProp = () => {
  if (tabletPropId === null) return;
  PropAttach.remove(tabletPropId);
  tabletPropId = null;
};

export const startTabletAnimation = async () => {
  cleanTabletProp();
  const ped = PlayerPedId();
  await Util.loadAnimDict('amb@code_human_in_bus_passenger_idles@female@tablet@base');
  TaskPlayAnim(
    ped,
    'amb@code_human_in_bus_passenger_idles@female@tablet@base',
    'base',
    3.0,
    3.0,
    -1,
    49,
    0,
    false,
    false,
    false
  );
  const propId = PropAttach.add('tablet');
  if (propId !== undefined) {
    tabletPropId = propId;
  }
};
global.exports('startTabletAnimation', startTabletAnimation);

export const stopTabletAnimation = () => {
  cleanTabletProp();
  TaskPlayAnim(
    PlayerPedId(),
    'amb@code_human_in_bus_passenger_idles@female@tablet@base',
    'exit',
    3.0,
    3.0,
    -1,
    49,
    0,
    false,
    false,
    false
  );
};
global.exports('stopTabletAnimation', stopTabletAnimation);

export const handleAnimationsServiceResourceStop = () => {
  stopTabletAnimation();

  animProps.forEach(ent => {
    if (!DoesEntityExist(ent)) return;
    Util.deleteEntity(ent);
  });
};

export const doLaptopHackAnimation = async (hackFunc?: () => Promise<boolean>): Promise<boolean> => {
  if (activeAnimations.has('laptophack')) return false;

  activeAnimations.add('laptophack');

  const ped = PlayerPedId();
  const coords = Util.getEntityCoords(ped).add({ x: 0, y: 0, z: 0.4 });
  const rotation = Util.getEntityRotation(ped);

  await Util.loadAnimDict('anim@heists@ornate_bank@hack');

  const spawnedLaptopObject = await Util.createObjectOnServer('hei_prop_hst_laptop', coords);
  if (!spawnedLaptopObject) {
    activeAnimations.delete('laptophack');
    return false;
  }

  const laptopObject = spawnedLaptopObject.entity;
  animProps.add(laptopObject);

  const { x, y, z } = coords;
  const { x: rx, y: ry, z: rz } = rotation;

  let scene = NetworkCreateSynchronisedScene(x, y, z, rx, ry, rz, 2, false, false, 1065353216, 0.7, 1.0);
  NetworkAddPedToSynchronisedScene(
    ped,
    scene,
    'anim@heists@ornate_bank@hack',
    'hack_enter',
    1.5,
    -4.0,
    1,
    16,
    1148846080,
    0
  );
  NetworkAddEntityToSynchronisedScene(
    laptopObject,
    scene,
    'anim@heists@ornate_bank@hack',
    'hack_loop_laptop',
    4.0,
    -8.0,
    1
  );
  NetworkStartSynchronisedScene(scene);
  await Util.Delay(1800);

  // anim part 2
  scene = NetworkCreateSynchronisedScene(x, y, z, rx, ry, rz, 2, false, true, 1065353216, 0, 1.3);
  NetworkAddPedToSynchronisedScene(
    ped,
    scene,
    'anim@heists@ornate_bank@hack',
    'hack_loop',
    1.3,
    -4.0,
    1,
    16,
    1148846080,
    0
  );
  NetworkAddEntityToSynchronisedScene(
    laptopObject,
    scene,
    'anim@heists@ornate_bank@hack',
    'hack_loop_laptop',
    4.0,
    -8.0,
    1
  );
  NetworkStartSynchronisedScene(scene);
  await Util.Delay(2000);

  const success = (await hackFunc?.()) ?? true;

  // Do animation cleanup in timeout so we can immediately return success
  setTimeout(() => {
    scene = NetworkCreateSynchronisedScene(x, y, z, rx, ry, rz, 2, false, false, 1065353216, 0, 1.3);
    NetworkAddPedToSynchronisedScene(
      ped,
      scene,
      'anim@heists@ornate_bank@hack',
      'hack_exit',
      1.0,
      -1.0,
      1,
      16,
      1148846080,
      0
    );
    NetworkAddEntityToSynchronisedScene(
      laptopObject,
      scene,
      'anim@heists@ornate_bank@hack',
      'hack_exit_laptop',
      4.0,
      -8.0,
      1
    );
    NetworkStartSynchronisedScene(scene);

    setTimeout(() => {
      NetworkStopSynchronisedScene(scene);
      Util.deleteEntity(laptopObject);
      animProps.delete(laptopObject);
      RemoveAnimDict('anim@heists@ornate_bank@hack');
      activeAnimations.delete('laptophack');
    }, 1500);
  }, 750);

  return success;
};
global.exports('doLaptopHackAnimation', doLaptopHackAnimation);
