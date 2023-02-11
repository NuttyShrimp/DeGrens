import { Events } from '@dgx/server';
import { fuelManager } from './classes/fuelManager';
import { doRefuel, openRefuelMenu } from './service.fuel';

Events.onNet('vehicle:fuel:overrideSet', (src: number, netId: number, fuelLevel: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;
  fuelManager.setFuelLevel(vehicle, fuelLevel);
});

Events.onNet('vehicles:fuel:doRefuel', (src, netId: number) => {
  doRefuel(src, netId);
});

Events.onNet('vehicles:fuel:openRefuelMenu', (src, netId: number) => {
  openRefuelMenu(src, netId);
});

//@ts-ignore
AddStateBagChangeHandler('fuelLevel', null, (bagName: string, _, value: number) => {
  const netId = Number(bagName.replace('entity:', ''));
  if (Number.isNaN(netId)) return;
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  fuelManager.handleStateChange(vehicle, value);
});
