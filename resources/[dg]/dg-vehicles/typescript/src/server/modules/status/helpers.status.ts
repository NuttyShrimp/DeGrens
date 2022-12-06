import { Util } from '@dgx/server';

export const getTyreState = async (veh: number) => {
  const netId = NetworkGetNetworkIdFromEntity(veh);
  const state = await Util.sendRPCtoEntityOwner<number[]>(veh, 'vehicles:client:getTyreState', netId);
  return state ?? [];
};

export const getWindowState = async (veh: number) => {
  const netId = NetworkGetNetworkIdFromEntity(veh);
  const state = await Util.sendRPCtoEntityOwner<boolean[]>(veh, 'vehicles:client:getWindowSate', netId);
  return state ?? [];
};

export const getDoorState = async (veh: number) => {
  const netId = NetworkGetNetworkIdFromEntity(veh);
  const state = await Util.sendRPCtoEntityOwner<boolean[]>(veh, 'vehicles:client:getDoorSate', netId);
  return state ?? [];
};
