import { setFuelLevel } from '../service.fuel';
import { getCurrentVehicle } from '@helpers/vehicle';

//@ts-ignore
AddStateBagChangeHandler('fuelLevel', null, (bagName: string, _, value: number) => {
  const netId = Number(bagName.replace('entity:', ''));
  if (Number.isNaN(netId)) return;
  // handler fires before entity exists for client. This handler is used for current vehicle only so we dont need to await
  if (!NetworkDoesNetworkIdExist(netId) || !NetworkDoesEntityExistWithNetworkId(netId)) return;
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (getCurrentVehicle() !== veh) return;
  setFuelLevel(value);
});
