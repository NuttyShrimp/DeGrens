import { Events, Interiors, Notifications, RPC, Sounds, Util } from '@dgx/client';

import { getSelectedHouse, getSelectedHouseInfo, getShellTypes } from '../modules/house/controller.house';

export const enterInterior = async () => {
  Sounds.playLocalSound('houses_door_open', 1);
  doDoorAnimation();
  DoScreenFadeOut(500);
  await Util.Delay(500);

  let houseInfo = getSelectedHouseInfo();
  if (!houseInfo) {
    houseInfo = await RPC.execute<House.Data>('houserobbery:server:getHouseInfo', getSelectedHouse());
    if (!houseInfo) {
      Notifications.add('De bewoners van dit huis zijn momenteel thuis', 'error');
      return;
    }
  }

  const isSuccess = await Interiors.createRoom(getShellTypes()[houseInfo.size], {
    ...houseInfo.coords,
    z: houseInfo.coords.z - 50,
  });
  DoScreenFadeIn(250);
  if (!isSuccess) return;
  Events.emitNet('houserobbery:server:enterHouse', getSelectedHouse());
};

export const leaveInterior = async () => {
  Sounds.playLocalSound('houses_door_close', 0.4);
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
