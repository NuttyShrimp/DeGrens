import { UI } from '@dgx/client';

UI.RegisterUICallback('phone/pinger/request', (data, cb) => {
  emitNet('dg-phone:pinger:request', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/pinger/accept', (data, cb) => {
  emitNet('dg-phone:pinger:accept', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/pinger/decline', (data, cb) => {
  emitNet('dg-phone:pinger:decline', data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

onNet('dg-phone:pinger:sendRequest', (pingId: string, origin: number) => {
  PlaySound(-1, 'Click_Fail', 'WEB_NAVIGATION_SOUNDS_PHONE', false, 0, true);

  UI.SendAppEvent('phone', {
    appName: 'pinger',
    action: 'doRequest',
    data: {
      id: pingId,
      origin: origin,
    },
  });
});

const blips: Record<number, number> = {};

onNet('dg-phone:pinger:setPingLocation', (coords: Vec3, id: number) => {
  blips[id] = AddBlipForCoord(coords.x, coords.y, coords.z);
  SetBlipSprite(blips[id], 280);
  SetBlipColour(blips[id], 4);
  SetBlipScale(blips[id], 0.8);
  SetBlipAsShortRange(blips[id], true);
  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString('Pinged location');
  EndTextCommandSetBlipName(blips[id]);
  setTimeout(() => {
    if (!blips[id]) return;
    RemoveBlip(blips[id]);
    delete blips[id];
  }, 20000);
});
