import { BaseEvents, BlipManager, Events, RPC, UI, Util, Vehicles } from '@dgx/client';
import { getNearestColorFromHex, getDataOfGTAColorById } from '@dgx/shared';
import { areBlipsEnabled, clearBlips, syncBlips, updateSprite } from 'services/blips';
import { closeCam, openCam, seedUICams } from 'services/cams';
import {
  addCallBlip,
  flashNewCalls,
  areDispatchNotificationsDisabled,
  setDispatchOpen,
  setLastCallId,
  toggleDispatchNotifications,
} from 'services/dispatch';

UI.onLoad(() => {
  Events.emitNet('dg-dispatch:loadMore', 0);
  seedUICams();
});

BaseEvents.onEnteredVehicle(vehicle => {
  if (!areBlipsEnabled()) return;

  const vehicleClass = GetVehicleClass(vehicle);
  if (vehicleClass !== 15) return;

  Events.emitNet('dg-dispatch:updateBlipSprite', 43);
});

BaseEvents.onLeftVehicle(vehicle => {
  if (!areBlipsEnabled()) return;

  const vehicleClass = GetVehicleClass(vehicle);
  if (vehicleClass !== 15) return;

  Events.emitNet('dg-dispatch:updateBlipSprite', 1);
});

BaseEvents.onResourceStop(() => {
  UI.SendAppEvent('dispatch', {
    action: 'addCalls',
    calls: [],
    refresh: true,
  });
  BlipManager.removeCategory('dispatch');
  clearBlips();
  closeCam();
});

Events.onNet('dg-dispatch:addCalls', (calls: Dispatch.UICall[], refresh: boolean) => {
  if (areDispatchNotificationsDisabled()) return;
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
  if (areDispatchNotificationsDisabled()) return;
  UI.SendAppEvent('dispatch', {
    action: 'addCall',
    call,
  });
  addCallBlip(call);
  flashNewCalls();
  setLastCallId(call.id);

  if (call.important && !call.syncedSoundAlert) {
    PlaySound(-1, 'Event_Start_Text', 'GTAO_FM_Events_Soundset', false, 0, true);
  }
});

Events.onNet('dispatch:syncBlips', (blipInfo: Record<number, Dispatch.BlipInfo>) => {
  syncBlips(blipInfo);
});

Events.onNet('dispatch:removeBlips', () => {
  clearBlips();
});

Events.onNet('dispatch:updateSprite', (plyId: number, sprite: number) => {
  updateSprite(plyId, sprite);
});

Events.onNet('dispatch:toggleNotifications', toggleDispatchNotifications);

RPC.register('dispatch:getVehicleInfo', (vehNetId: number) => {
  const colorInfo = {
    primary: 'Unknown Color',
    secondary: 'Unknown Color',
  };

  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!veh || !DoesEntityExist(veh)) return colorInfo;

  const vehCosmetic = Vehicles.getCosmeticUpgrades(veh);
  if (!vehCosmetic) return colorInfo;

  if (typeof vehCosmetic.primaryColor === 'number') {
    const gtaColor = getDataOfGTAColorById(vehCosmetic.primaryColor)!;
    colorInfo.primary = gtaColor.name;
  } else {
    colorInfo.primary = getNearestColorFromHex(vehCosmetic.primaryColor)?.name;
  }
  if (typeof vehCosmetic.secondaryColor === 'number') {
    const gtaColor = getDataOfGTAColorById(vehCosmetic.secondaryColor)!;
    colorInfo.secondary = gtaColor.name;
  } else {
    colorInfo.secondary = getNearestColorFromHex(vehCosmetic.secondaryColor)?.name;
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

UI.onApplicationClose(() => {
  setDispatchOpen(false);
}, 'dispatch');

Events.onNet('dispatch:doCallAnim', async () => {
  const ped = PlayerPedId();
  await Util.loadAnimDict('cellphone@');
  TaskPlayAnim(ped, 'cellphone@', 'cellphone_call_listen_base', 3.0, -1, -1, 49, 0, false, false, false);
  setTimeout(() => {
    StopAnimTask(ped, 'cellphone@', 'cellphone_call_listen_base', 1.0);
  }, 5000);
});
