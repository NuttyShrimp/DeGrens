import { Util } from '@dgx/server';

export const syncExecution = (native: string, entity: number, ...args: any[]) => {
  if (!DoesEntityExist(entity)) return;
  Util.sendEventToEntityOwner(entity, 'sync:execute', native, NetworkGetNetworkIdFromEntity(entity), ...args);
};
