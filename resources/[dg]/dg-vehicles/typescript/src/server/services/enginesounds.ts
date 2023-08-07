import { Events, Config, Notifications, UI, Util } from '@dgx/server';
import { updateVehicleEngineSound } from 'db/repository';
import { getVinForNetId } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { mainLogger } from 'sv_logger';

const engineSounds: Vehicles.EngineSoundConfig[] = [];
const engineSoundLogger = mainLogger.child({ module: 'EngineSounds' });

export const loadEngineSounds = async () => {
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue<Vehicles.EngineSoundConfig[]>('vehicles.enginesounds');

  engineSounds.length = 0;
  for (let i = 0; i < config.length; i++) {
    engineSounds.push(config[i]);
  }
};

const getVehicleEngineSound = (vehicle: number): string => {
  return Entity(vehicle).state.engineSound;
};

export const setVehicleEngineSound = (vehicle: number, soundHash: string) => {
  Entity(vehicle).state.set('engineSound', soundHash, true);
};

Events.onNet('vehicles:enginesounds:set', (plyId, netId: number, idx: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  const engineSound = engineSounds[idx];
  if (!engineSound) return;

  setVehicleEngineSound(vehicle, engineSound.soundHash);
  Notifications.add(plyId, `Huidig: ${engineSound.label}`);
});

Events.onNet('vehicles:enginesounds:save', (plyId, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  const vin = getVinForNetId(netId);
  if (!vin) return;
  const engineSound = getVehicleEngineSound(vehicle);
  if (!engineSound) return;

  if (vinManager.isVinFromPlayerVeh(vin)) {
    updateVehicleEngineSound(vin, engineSound);
  }

  Notifications.add(plyId, 'Engine swap geinstalleerd');

  const logMsg = `${Util.getName(plyId)}(${plyId}) has set enginesound to ${engineSound} on ${vin}`;
  engineSoundLogger.info(logMsg);
  Util.Log('vehicles:enginesounds:save', { vin, engineSound }, logMsg, plyId);
});

Events.onNet('vehicles:enginesounds:reset', (plyId, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  const vin = getVinForNetId(netId);
  if (!vin) return;

  setVehicleEngineSound(vehicle, 'DEFAULT'); // Invalid modelhash always reverts to default, doesnt matter what we input here

  if (vinManager.isVinFromPlayerVeh(vin)) {
    updateVehicleEngineSound(vin, null);
  }

  Notifications.add(plyId, 'Engine swap verwijderd.');

  const logMsg = `${Util.getName(plyId)}(${plyId}) has reset enginesound of ${vin}`;
  engineSoundLogger.info(logMsg);
  Util.Log('vehicles:enginesounds:reset', { vin }, logMsg, plyId);
});

const openEngineSoundMenu = (plyId: number) => {
  const vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
  if (!vehicle || !DoesEntityExist(vehicle)) {
    Notifications.add(plyId, 'Je zit niet in een voertuig');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(vehicle);

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
        netId,
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
      data: {
        netId,
      },
    },
    {
      title: 'Opslaan',
      icon: 'floppy-disk',
      callbackURL: 'vehicles/enginesounds/save',
      data: {
        netId,
      },
    }
  );

  UI.openContextMenu(plyId, menuEntries);
};

global.exports('openEngineSoundMenu', openEngineSoundMenu);
