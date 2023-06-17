import { Events, Util } from '@dgx/client';
import {
  validateActionHandlerExistence,
  registerActionHandler,
  unregisterActionHandler,
  executeActionHandler,
} from './service.actions';

// we do different logic when we initiate action from client (ent should exist etc)
// than we do if we get assigned by server (ent might not exist, keep track of netId to respond)

global.exports('executeAction', (action: string, entity: number, ...args: unknown[]) => {
  validateActionHandlerExistence(action);

  // if we initiate from client, entity should exist (how you gonna get an entity handle otherwise bruv?)
  if (!DoesEntityExist(entity)) {
    console.error(`[Sync] Tried to execute action '${action}' on invalid entity ${entity}`);
    return;
  }

  if (NetworkHasControlOfEntity(entity)) {
    executeActionHandler(action, entity, ...args);
  } else {
    Events.emitNet('sync:request', action, NetworkGetNetworkIdFromEntity(entity), args);
  }
});

Events.onNet('sync:execute', async (action: string, netId: number, args: unknown[]) => {
  validateActionHandlerExistence(action);

  if (NetworkDoesEntityExistWithNetworkId(netId)) {
    const entity = NetworkGetEntityFromNetworkId(netId);
    if (DoesEntityExist(entity) && NetworkHasControlOfEntity(entity)) {
      executeActionHandler(action, entity, ...args);

      // if was owner for less than 600ms, we try again. time was determined to as the least amount for good consistency
      await Util.Delay(600);

      if (DoesEntityExist(entity) && NetworkHasControlOfEntity(entity)) return;
    }
  }

  // we timeout the retries to avoid spam
  // retries when we execute by assignation from server should rarely happen.
  // but can happen when no one is owner and new owner quickly moves out of scope again
  setTimeout(() => {
    Events.emitNet('sync:request', action, netId, args);
  }, 200);
});

global.exports('registerActionHandler', registerActionHandler);
global.exports('unregisterActionHandler', unregisterActionHandler);
