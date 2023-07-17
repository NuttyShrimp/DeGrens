import { Events, Statebags, UI } from '@dgx/client';

Statebags.addEntityStateBagChangeHandler('entity', 'engineSound', (_, vehicle, engineSound) => {
  ForceVehicleEngineAudio(vehicle, engineSound);
});

UI.RegisterUICallback('vehicles/enginesounds/set', (data: { netId: number; idx: string }, cb) => {
  Events.emitNet('vehicles:enginesounds:set', data.netId, data.idx);
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('vehicles/enginesounds/save', (data: { netId: number }, cb) => {
  Events.emitNet('vehicles:enginesounds:save', data.netId);
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('vehicles/enginesounds/reset', (data: { netId: number }, cb) => {
  Events.emitNet('vehicles:enginesounds:reset', data.netId);
  cb({ data: {}, meta: { ok: true, message: '' } });
});
