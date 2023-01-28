import { Events, Interiors, Util } from '@dgx/client';

import { getSelectedHouse, getSelectedHouseInfo, getShellTypes } from '../modules/house/controller.house';

export const enterInterior = async () => {
  emitNet('InteractSound_SV:PlayOnSource', 'houses_door_open', 0.25);
  doDoorAnimation();
  DoScreenFadeOut(500);
  await Util.Delay(500);

  const { size, coords } = getSelectedHouseInfo()!;
  const isSuccess = await Interiors.createRoom(getShellTypes()[size], {
    ...coords,
    z: coords.z - 50,
  });
  DoScreenFadeIn(250);
  if (!isSuccess) return;
  Events.emitNet('houserobbery:server:enterHouse', getSelectedHouse());
};

export const leaveInterior = async () => {
  emitNet('InteractSound_SV:PlayOnSource', 'houses_door_open', 0.25);
  doDoorAnimation();
  DoScreenFadeOut(500);
  await Util.Delay(500);

  Interiors.exitRoom();
  Events.emitNet('houserobbery:server:leaveHouse', getSelectedHouse());

  DoScreenFadeIn(500);
  await Util.Delay(500);
};

const doDoorAnimation = async () => {
  const ped = PlayerPedId();
  await Util.loadAnimDict('anim@heists@keycard@');
  TaskPlayAnim(ped, 'anim@heists@keycard@', 'exit', 5.0, 1.0, -1, 16, 0, false, false, false);
  await Util.Delay(400);
  StopAnimTask(ped, 'anim@heists@keycard@', 'exit', 1.0);
};
