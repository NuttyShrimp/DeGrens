import { setFuelLevel } from '../service.fuel';
import { getCurrentVehicle } from '@helpers/vehicle';

//@ts-ignore
AddStateBagChangeHandler('fuelLevel', null, (bagName: string, _, value: number) => {
  const netId = Number(bagName.replace('entity:', ''));
  if (Number.isNaN(netId)) return;
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (getCurrentVehicle() !== veh) return;
  setFuelLevel(value);
});
