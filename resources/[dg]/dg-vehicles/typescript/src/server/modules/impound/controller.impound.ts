import { Auth, Events } from '@dgx/server';

import {
  checkPermaImpoundVehicleStock,
  finishImpound,
  getZones,
  loadImpoundConfig,
  openImpoundList,
  openReasonSelectionMenu,
  requestImpound,
  unbailVehicle,
} from './service.impound';

setImmediate(async () => {
  await loadImpoundConfig();
  checkPermaImpoundVehicleStock();
});

on('dg-config:moduleLoaded', (key: string) => {
  if (key !== 'vehicles.impound') return;
  loadImpoundConfig();
});

Events.onNet('vehicles:depot:server:openSelectionMenu', (src, vehNetID: number) => {
  openReasonSelectionMenu(src, vehNetID);
});

Events.onNet('vehicles:depot:server:requestImpound', (src, reasonTitle: string, vehNetId: number, inSpot: boolean) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  requestImpound(src, reasonTitle, veh, inSpot);
});

Events.onNet('vehicles:depot:server:doImpound', (src, vehNetId: number) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  finishImpound(src, veh);
});

Events.onNet('vehicles:impound:server:getList', src => {
  openImpoundList(src);
});

Events.onNet('vehicles:impound:server:unBail', (src, vin: string) => {
  unbailVehicle(src, vin);
});
