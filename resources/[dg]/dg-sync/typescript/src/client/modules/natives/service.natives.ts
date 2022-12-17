import { Events } from '@dgx/client';
import { ACTIONS } from './constants.natives';

export const syncExecution = (native: keyof typeof ACTIONS, entity: number, ...args: any[]) => {
  if (!(native in ACTIONS)) return;
  if (!DoesEntityExist(entity)) return;

  if (NetworkHasControlOfEntity(entity)) {
    (ACTIONS[native] as (entity: number, ...args: any[]) => void)(entity, ...args);
  } else {
    Events.emitNet('sync:request', native, NetworkGetNetworkIdFromEntity(entity), ...args);
  }
};
