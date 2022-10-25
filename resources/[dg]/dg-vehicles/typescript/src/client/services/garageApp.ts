import { Events, RPC, UI } from '@dgx/client';

let trackedVehBlip: number;
let trackedVehTimeout: NodeJS.Timeout | null;

UI.RegisterUICallback('phone/garage/get', async (_, cb) => {
  const vehicles = await RPC.execute('vehicles:server:app:getVehicles');
  cb({
    data: vehicles,
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('phone/garage/track', (data: { vin: string }, cb) => {
  Events.emitNet('vehicles:server:app:trackVehicle', data.vin);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('phone/garage/sell', (data: { cid: number; vin: string; price: number }, cb) => {
  Events.emitNet('vehicles:server:app:sellVehicle', data.cid, data.vin, data.price);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

Events.onNet('vehicles:server:app:setTrackedBlip', (coords: Vec3) => {
  if (trackedVehBlip && DoesBlipExist(trackedVehBlip)) {
    RemoveBlip(trackedVehBlip);
    trackedVehBlip = 0;
  }
  if (trackedVehTimeout) {
    clearTimeout(trackedVehTimeout);
  }
  trackedVehBlip = AddBlipForCoord(coords.x, coords.y, coords.z);
  SetBlipSprite(trackedVehBlip, 225);
  SetBlipColour(trackedVehBlip, 0);
  SetBlipDisplay(trackedVehBlip, 2);
  SetBlipScale(trackedVehBlip, 1);
  SetBlipAsShortRange(trackedVehBlip, true);
  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString('Getraceerd Voertuig');
  EndTextCommandSetBlipName(trackedVehBlip);
  trackedVehTimeout = setTimeout(() => {
    RemoveBlip(trackedVehBlip);
    trackedVehBlip = 0;
    trackedVehTimeout = null;
  }, 5000);
});
