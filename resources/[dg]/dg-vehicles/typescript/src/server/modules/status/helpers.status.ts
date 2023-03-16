import { Util } from '@dgx/server';

export const getTyreState = async (vehicle: number) => {
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const state = await Util.sendRPCtoEntityOwner<number[]>(vehicle, 'vehicles:client:getTyreState', netId);
  return state ?? [];
};

export const getWindowState = async (vehicle: number) => {
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const state = await Util.sendRPCtoEntityOwner<boolean[]>(vehicle, 'vehicles:client:getWindowState', netId);
  return state ?? [];
};

export const getDoorState = async (vehicle: number) => {
  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const state = await Util.sendRPCtoEntityOwner<boolean[]>(vehicle, 'vehicles:client:getDoorState', netId);
  return state ?? [];
};
