import { Core, Events, Notifications, Statebags, UI } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';

let menuVehicleNetId: number | null = null;
let scheduledSoundChanges: { vehicle: number; engineSound: string }[] = [];

Statebags.addEntityStateBagChangeHandler<string>('entity', 'engineSound', (_, vehicle, engineSound) => {
  if (!LocalPlayer.state.isLoggedIn) {
    scheduledSoundChanges.push({ vehicle, engineSound });
    return;
  }

  ForceVehicleEngineAudio(vehicle, engineSound);
});

Events.onNet('vehicles:enginesounds:openMenu', (engineSounds: Vehicles.EngineSoundConfig[]) => {
  const vehicle = getCurrentVehicle();
  if (!vehicle || !DoesEntityExist(vehicle)) {
    Notifications.add('Je zit niet in een voertuig', 'error');
    return;
  }

  if (menuVehicleNetId !== null) {
    Notifications.add('Het enginesound menu staat al open', 'error');
    return;
  }

  menuVehicleNetId = NetworkGetNetworkIdFromEntity(vehicle);

  const menuEntries: ContextMenu.Entry[] = [
    {
      title: 'Engine Swap',
      icon: 'engine',
      disabled: true,
    },
  ];

  const customMenuEntries: ContextMenu.Entry[] = [];
  const nativeMenuEntries: ContextMenu.Entry[] = [];

  for (let i = 0; i < engineSounds.length; i++) {
    const entry: ContextMenu.Entry = {
      title: engineSounds[i].label,
      preventCloseOnClick: true,
      callbackURL: 'vehicles/enginesounds/set',
      data: {
        idx: i,
      },
    };
    if (engineSounds[i].custom) {
      customMenuEntries.push(entry);
    } else {
      nativeMenuEntries.push(entry);
    }
  }

  menuEntries.push(
    {
      title: 'Normale Engines',
      submenu: nativeMenuEntries.sort((a, b) => a.title.localeCompare(b.title)),
    },
    {
      title: 'Custom Engines',
      submenu: customMenuEntries.sort((a, b) => a.title.localeCompare(b.title)),
    },
    {
      title: 'Reset',
      icon: 'arrows-rotate',
      callbackURL: 'vehicles/enginesounds/reset',
    }
  );

  UI.openApplication('contextmenu', menuEntries);
});

UI.onApplicationClose(() => {
  handleEngineSoundMenuClose();
}, 'contextmenu');

UI.onUIReload(() => {
  handleEngineSoundMenuClose();
});

const handleEngineSoundMenuClose = () => {
  if (menuVehicleNetId === null) return;

  Events.emitNet('vehicles:enginesounds:save', menuVehicleNetId);
  menuVehicleNetId = null;
};

UI.RegisterUICallback('vehicles/enginesounds/set', (data: { idx: string }, cb) => {
  if (menuVehicleNetId === null) return;
  Events.emitNet('vehicles:enginesounds:set', menuVehicleNetId, data.idx);
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('vehicles/enginesounds/reset', (_, cb) => {
  if (menuVehicleNetId === null) return;
  Events.emitNet('vehicles:enginesounds:reset', menuVehicleNetId);
  menuVehicleNetId = null; // stop saving on close
  cb({ data: {}, meta: { ok: true, message: '' } });
});

Core.onPlayerLoaded(() => {
  for (const { vehicle, engineSound } of scheduledSoundChanges) {
    if (!DoesEntityExist(vehicle)) continue;
    ForceVehicleEngineAudio(vehicle, engineSound);
  }
  scheduledSoundChanges = [];
});

export const closeEngineSoundMenuOnVehicleExit = () => {
  if (menuVehicleNetId === null) return;
  UI.closeApplication('contextmenu');
};
