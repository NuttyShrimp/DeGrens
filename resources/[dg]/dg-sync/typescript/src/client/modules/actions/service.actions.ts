import { Events, Util } from '@dgx/client';
import { DEFAULT_ACTIONS } from './constants.actions';

const registeredActions: Record<string, Sync.ActionHandler> = { ...DEFAULT_ACTIONS };

export const registerActionHandler = (action: string, handler: Sync.ActionHandler) => {
  if (action in registeredActions) {
    console.log(`[Sync] '${action}' is already registered, overwriting...`);
  }

  registeredActions[action] = handler;
};

export const unregisterActionHandler = (action: string) => {
  if (!(action in registeredActions)) {
    console.error(`[Sync] Tried to unregister unknown action: '${action}'`);
    return;
  }

  delete registeredActions[action];
};

export const executeAction = (action: string, entity: number, ...args: any[]) => {
  if (!(action in registeredActions)) {
    console.error(`[Sync] Provided invalid action: '${action}'`);
    return;
  }

  if (!entity || !DoesEntityExist(entity)) {
    console.error(`[Sync] Failed executing of '${action}' because entity did not exist`);
    return;
  }

  if (NetworkHasControlOfEntity(entity)) {
    if (Util.isDevEnv()) {
      console.log(`[Sync] Executing '${action}' on entity ${entity} with args: ${args.map(a => String(a)).join(', ')}`);
    }
    registeredActions[action](entity, ...args);
  } else {
    Events.emitNet('sync:request', action, NetworkGetNetworkIdFromEntity(entity), ...args);
  }
};
