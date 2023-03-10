import { Sounds, Interiors, Events, Util } from '@dgx/client';
import { getActiveLocation } from 'modules/house/service.house';

let shellTypes: Record<string, string> = {};
let insideHouseId: string | null = null;

export const setShellTypes = (types: typeof shellTypes) => {
  shellTypes = types;
};

export const getInsideHouseId = () => insideHouseId;

export const enterInterior = async (houseId: string) => {
  const location = getActiveLocation(houseId);
  if (!location) {
    console.log('[HouseRobbery] tried to enter non activated house');
    return;
  }

  Sounds.playLocalSound('houses_door_open', 1);
  doDoorAnimation();
  DoScreenFadeOut(500);
  await Util.Delay(500);

  const shellType = shellTypes[location.size];
  if (!shellType) return;

  const isSuccess = await Interiors.createRoom(shellType, {
    ...location.coords,
    z: location.coords.z - 50,
  });
  DoScreenFadeIn(250);
  if (!isSuccess) return;

  insideHouseId = houseId;
  Events.emitNet('houserobbery:server:enterHouse', houseId);
};

export const leaveInterior = async () => {
  Sounds.playLocalSound('houses_door_close', 0.4);
  doDoorAnimation();
  DoScreenFadeOut(500);
  await Util.Delay(500);

  Interiors.exitRoom();
  Events.emitNet('houserobbery:server:leaveHouse', insideHouseId);

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
