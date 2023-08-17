import { Config } from '@dgx/server';

const CONFIG_KEY = 'carboosting';

let configData: Carboosting.Config | null = null;
const config = new Proxy(
  {},
  {
    get(_: any, prop: keyof Carboosting.Config) {
      if (configData == null) {
        throw new Error('Config was not loaded yet...');
      }
      return configData[prop];
    },
  }
);

let locations: Partial<Record<Vehicles.Class, Carboosting.LocationConfig[]>> = {};

const setConfig = (c: Carboosting.Config) => {
  configData = c;

  locations = {};
  for (const location of c.locations) {
    for (const classForLocation of location.classes) {
      (locations[classForLocation] ??= []).push(location);
    }
  }
};

on('dg-config:moduleLoaded', (module: string, c: Carboosting.Config) => {
  if (module !== CONFIG_KEY) return;
  setConfig(c);
});

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  const c = Config.getConfigValue<Carboosting.Config>(CONFIG_KEY);
  setConfig(c);
};

export default config as Carboosting.Config;

export const getClassConfig = (vehicleClass: Vehicles.Class): Carboosting.ClassConfig => {
  return config.classes[vehicleClass];
};

export const tryClassChanceEntry = (
  vehicleClass: Vehicles.Class,
  chanceType: keyof Carboosting.ClassConfig['chances']
): boolean => {
  return Math.random() <= getClassConfig(vehicleClass).chances[chanceType];
};

export const getLocationsForClass = (vehicleClass: Vehicles.Class) => {
  if (!locations[vehicleClass]) throw new Error(`Could not find locations for class ${vehicleClass}`);
  return locations[vehicleClass]!;
};
