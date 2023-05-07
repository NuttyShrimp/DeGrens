import { Business, Config, Events } from '@dgx/server';
import { setTowOffsets } from './services/towing.mechanic';

let config: Mechanic.Config;

// region Config
export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue('vehicles.mechanic');
  loadZones(-1);
  setTowOffsets(config.towVehicles);
};

export const getMechanicConfig = () => config;

export const loadZones = (src: number) => {
  Events.emitNet('vehicles:mechanic:client:loadConfig', src, Object.keys(config.towVehicles));
};
// endregion

// Returns the mechanic business the player is inside and signed into
export const getCurrentMechanicBusiness = (plyId: number) => {
  const inside = Business.getBusinessPlayerIsInsideOf(plyId);
  if (!inside || inside.type !== 'mechanic') return;

  if (!Business.isPlayerSignedIn(plyId, inside.name)) return;

  return inside.name;
};
