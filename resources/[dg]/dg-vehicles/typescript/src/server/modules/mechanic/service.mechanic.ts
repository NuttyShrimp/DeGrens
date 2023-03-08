import { Config, Events, Notifications } from '@dgx/server';

// Object of all shops and their clocked in employees
const activeMechanics: Record<string, number[]> = {};
let config: Mechanic.Config;

export const getAmountOfActiveMechanics = () => new Array<number>().concat(...Object.values(activeMechanics)).length;

// region Config
export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue('vehicles.mechanic');
  loadZones(-1);
};

export const getMechanicConfig = () => config;

export const loadZones = (src: number) => {
  Events.emitNet('vehicles:mechanic:client:loadConfig', src, config.shops, config.towVehicles);
};
// endregion

// region Clock-in
export const clockPlayerIn = (src: number, shop: string) => {
  const plyShop = getShopForPlayer(src);
  if (plyShop) {
    Notifications.add(src, `Je bent al ingeclocked ergens anders!`, 'error');
    return;
  }
  if (!activeMechanics[shop]) {
    activeMechanics[shop] = [];
  }
  activeMechanics[shop].push(src);
};

export const clockPlayerOut = (src: number) => {
  for (const shop in activeMechanics) {
    activeMechanics[shop] = activeMechanics[shop].filter(serverId => serverId !== Number(src));
  }
};

export const getActiveMechanics = () => activeMechanics;

export const getShopForPlayer = (src: number) => {
  for (const shop in activeMechanics) {
    if (activeMechanics[shop].includes(src)) {
      return shop;
    }
  }
};
// endregion
