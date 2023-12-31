import { Util } from '@dgx/server';

export const executeAction = async (action: string, entity: number, ...args: any[]) => {
  const owner = await Util.awaitOwnership(entity);
  if (!owner) return;

  emitNet('sync:execute', owner, action, NetworkGetNetworkIdFromEntity(entity), args);
};
