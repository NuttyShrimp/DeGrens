import { Events, RPC, UI } from '@dgx/client';
import { getNearestColorFromHex } from '@dgx/shared/helpers/colorNames';
import { getDataOfGTAColorById } from '@dgx/shared/helpers/gtacolors';
import { clearBlips, syncBlips, updateBlipCoords, updateSprite } from 'services/blips';
import { closeCam, openCam, seedUICams } from 'services/cams';
import {
  addCallBlip,
  disableDispatch,
  enableDispatch,
  flashNewCalls,
  isDispatchDisabled,
  setLastCallId,
} from 'services/dispatch';

on('dg-ui:loadData', () => {
  Events.emitNet('dg-dispatch:loadMore', 0);
  seedUICams();
});

on('baseevents:enteredVehicle', (pVehicle: number, pSeat: number) => {
  const vehicleClass = GetVehicleClass(pVehicle);
  if (vehicleClass !== 15 || (pSeat !== -1 && pSeat !== 0)) return;

  Events.emitNet('dg-dispatch:updateBlipSprite', 43);
});

on('baseevents:leftVehicle', (pVehicle: number, pSeat: number) => {
  const vehicleClass = GetVehicleClass(pVehicle);
  if (vehicleClass !== 15 || (pSeat !== -1 && pSeat !== 0)) return;

  Events.emitNet('dg-dispatch:updateBlipSprite', 0);
});

on('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  UI.SendAppEvent('dispatch', {
    action: 'addCalls',
    calls: [],
    refresh: true,
  });
  DGCore.Blips.removeCategory('dispatch');
  clearBlips();
  closeCam();
});

onNet('sync:coords:sync', (plyCoords: Record<number, Vec3>) => {
  for (const key in plyCoords) {
    const plyId = Number(key);
    updateBlipCoords(plyId, plyCoords[plyId]);
  }
});

Events.onNet('dg-dispatch:addCalls', (calls: Dispatch.UICall[], refresh: boolean) => {
  if (isDispatchDisabled()) return;
  UI.SendAppEvent('dispatch', {
    action: 'addCalls',
    calls,
    refresh,
  });
  if (refresh && calls[0]?.id) {
    setLastCallId(calls[0].id);
  }
});

Events.onNet('dg-dispatch:addCall', (call: Dispatch.UICall) => {
  if (isDispatchDisabled()) return;
  UI.SendAppEvent('dispatch', {
    action: 'addCall',
    call,
  });
  addCallBlip(call);
  flashNewCalls();
  setLastCallId(call.id);
});

Events.onNet('dispatch:syncBlips', (blipInfo: Record<number, Dispatch.BlipInfo>) => {
  syncBlips(blipInfo);
});

Events.onNet('dispatch:removeBlips', () => {
  clearBlips();
});

Events.onNet('dispatch:updateSprite', (plyId: number, info: Dispatch.BlipInfo, sprite: number) => {
  updateSprite(plyId, info, sprite);
});

Events.onNet('dispatch:toggleDispatchNotifications', () => {
  Events.emitNet('dispatch:toggleDispatchBlip', isDispatchDisabled());
  isDispatchDisabled() ? enableDispatch() : disableDispatch();
});

RPC.register('dispatch:getVehicleInfo', (vehNetId: number) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  const vehCosmetic = global.exports['dg-vehicles'].getCosmeticUpgrades(veh);
  const colorInfo = {
    primary: '',
    secondary: '',
  };
  if (typeof vehCosmetic.primaryColor === 'number') {
    const gtaColor = getDataOfGTAColorById(vehCosmetic.primaryColor)!;
    colorInfo.primary = gtaColor.name;
  } else {
    colorInfo.primary = getNearestColorFromHex(vehCosmetic.primaryColor);
  }
  if (typeof vehCosmetic.secondaryColor === 'number') {
    const gtaColor = getDataOfGTAColorById(vehCosmetic.secondaryColor)!;
    colorInfo.secondary = gtaColor.name;
  } else {
    colorInfo.secondary = getNearestColorFromHex(vehCosmetic.secondaryColor);
  }
  return colorInfo;
});

RPC.register('dispatch:getLocationName', (coords: Vec3) => {
  const [s1, s2] = GetStreetNameAtCoord(coords.x, coords.y, coords.z);
  let streetLabel = GetStreetNameFromHashKey(s1);
  const secStreetName = GetStreetNameFromHashKey(s2);
  if (secStreetName) {
    streetLabel += ` ${secStreetName}`;
  }
  return streetLabel;
});

UI.RegisterUICallback('dispatch/load', (data: { offset: number }, cb) => {
  Events.emitNet('dg-dispatch:loadMore', data.offset);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('dispatch/setLocation', (data: { id: string }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  Events.emitNet('dispatch:server:setMarker', data.id);
});

UI.RegisterUICallback('dispatch/openCamera', (data: { id: number }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  openCam(data.id);
});
