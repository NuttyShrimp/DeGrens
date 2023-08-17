import { Core, Events, Statebags, UI } from '@dgx/client';

let scheduledSoundChanges: { vehicle: number; engineSound: string }[] = [];

Statebags.addEntityStateBagChangeHandler<string>('entity', 'engineSound', (_, vehicle, engineSound) => {
  if (!LocalPlayer.state.isLoggedIn) {
    scheduledSoundChanges.push({ vehicle, engineSound });
    return;
  }

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

Core.onPlayerLoaded(() => {
  for (const { vehicle, engineSound } of scheduledSoundChanges) {
    if (!DoesEntityExist(vehicle)) continue;
    ForceVehicleEngineAudio(vehicle, engineSound);
  }
  scheduledSoundChanges = [];
});
