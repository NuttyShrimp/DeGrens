import { Config } from '@dgx/server';

let vehicleShopConfig: VehicleShop.Config | null = null;
const CONFIG_PATH = 'vehicles.shop';

export const getVehicleShopConfig = () => {
  if (vehicleShopConfig === null) {
    throw new Error('Vehicle Shop Config is not defined');
  }
  return vehicleShopConfig;
};

const loadVehicleShopConfig = async () => {
  await Config.awaitConfigLoad();
  vehicleShopConfig = Config.getConfigValue<VehicleShop.Config>(CONFIG_PATH);
};

setImmediate(() => {
  loadVehicleShopConfig();
});

on('dg-config:moduleLoaded', (module: string) => {
  if (module !== CONFIG_PATH) return;
  loadVehicleShopConfig();
});
