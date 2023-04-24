import { Util } from '@dgx/server';

export const executeAction = (action: string, entity: number, ...args: any[]) => {
  if (!action || !DoesEntityExist(entity)) {
    console.error(`[Sync] Failed executing of '${action}' because entity did not exist`);
    return;
  }

  Util.sendEventToEntityOwner(entity, 'sync:execute', action, NetworkGetNetworkIdFromEntity(entity), ...args);
};
