import { Util } from '@dgx/client';

import { drawText3d } from '../modules/util/service.util';

let blipsEnabled = false;
let tick: number;
let blipInterval: NodeJS.Timer;
let plyBlips: Record<number, number> = {};

export const togglePlayerBlips = (isEnabled: boolean) => {
  isEnabled ? disableBlips() : enableBlips();
};

const enableBlips = () => {
  blipsEnabled = true;
  const plyId = PlayerId();
  tick = setTick(() => {
    if (!blipsEnabled) {
      clearTick(tick);
      return;
    }
    GetActivePlayers().forEach((ply: number) => {
      if (ply === plyId) return;
      const ped = GetPlayerPed(ply);
      const coords = Util.getEntityCoords(ped);
      coords.z += 1.0;
      drawText3d(`${GetPlayerName(ply)}(${GetPlayerServerId(ply)})`, coords, 0.4);
    });
  });
  blipInterval = setInterval(() => {
    if (!blipsEnabled) {
      clearInterval(blipInterval);
      return;
    }
    const plys = GetActivePlayers();
    // Remove blips for players that are no longer active
    for (const ply in plyBlips) {
      if (!plys.includes(ply)) {
        RemoveBlip(plyBlips[ply]);
        delete plyBlips[ply];
      }
    }
    plys.forEach((ply: number) => {
      if (plyBlips[ply]) return;
      const ped = GetPlayerPed(ply);
      const blip = AddBlipForEntity(ped);
      SetBlipSprite(blip, 1);
      SetBlipColour(blip, 1);
      SetBlipAsShortRange(blip, true);
      BeginTextCommandSetBlipName('STRING');
      AddTextComponentString(`${GetPlayerName(ply)}(${GetPlayerServerId(ply)})`);
      EndTextCommandSetBlipName(blip);
      SetBlipCategory(blip, 7);
      plyBlips[ply] = blip;
    });
  }, 1000);
};

const disableBlips = () => {
  blipsEnabled = false;
  clearTick(tick);
  clearInterval(blipInterval);
  for (const ply in plyBlips) {
    RemoveBlip(plyBlips[ply]);
  }
  plyBlips = {};
};
