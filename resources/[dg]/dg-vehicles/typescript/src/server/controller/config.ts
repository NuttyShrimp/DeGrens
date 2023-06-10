import { Auth, Config, Events, Util } from '@dgx/server';
import { getZones as getBennyZones } from 'modules/bennys/modules/zones';
import { GetGarages, areGaragesLoaded } from 'modules/garages/service.garages';
import { getZones as getImpoundZones } from 'modules/impound/service.impound';
import { NO_LOCK_CLASSES } from 'modules/keys/constants.keys';
import { loadZones as loadMechanicZones } from 'modules/mechanic/service.mechanic';
import { getVehicleShopConfig } from 'modules/vehicleshop/services/config.vehicleshop';

// TODO: If someone has time enough, refactor this
// We should add a client+shared config thing in dg-config that we can use to replace this nightmare
Auth.onAuth(async src => {
  await Config.awaitConfigLoad();
  const vehConfig = Config.getModuleConfig('vehicles');
  if (!vehConfig) return;
  Events.emitNet('vehicles:bennys:load', src, getBennyZones());
  Events.emitNet('vehicles:depot:loadZones', src, getImpoundZones());
  Events.emitNet('vehicles:keys:setClassesWithoutLock', src, NO_LOCK_CLASSES.door);
  loadMechanicZones(src);
  Events.emitNet('vehicles:nos:setConfig', src, vehConfig.config.nos);
  Events.emitNet('vehicles:service:setDegradationValues', src, vehConfig.service.degradationValues);
  Events.emitNet('vehicles:itemupgrades:loadZone', src, vehConfig.config.itemUpgradesZone);
  const { shopZone, vehicleSpawnLocation } = getVehicleShopConfig();
  Events.emitNet('vehicles:shop:buildZone', src, shopZone, vehicleSpawnLocation);
  Events.emitNet('vehicles:modes:load', src, vehConfig.handlings);
  await Util.awaitCondition(() => areGaragesLoaded());
  emitNet('vehicles:garages:load', src, GetGarages());
});
