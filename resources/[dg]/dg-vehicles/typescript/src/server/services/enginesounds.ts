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
  Events.emitNet('vehicles:enginesounds:openMenu', plyId, engineSounds);
};

global.exports('openEngineSoundMenu', openEngineSoundMenu);
