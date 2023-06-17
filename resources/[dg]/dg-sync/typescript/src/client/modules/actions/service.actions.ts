import { Util } from '@dgx/client';
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

export const validateActionHandlerExistence = (action: string) => {
  if (action in registeredActions) return;
  throw new Error(`[Sync] Provided invalid action: '${action}'`);
};

export const executeActionHandler = (action: string, entity: number, ...args: unknown[]) => {
  if (Util.isDevEnv()) {
    console.log(
      `[Sync] Executing '${action}' on entity ${entity} with args: ${args.map(a => JSON.stringify(a)).join(', ')}`
    );
  }
  registeredActions[action](entity, ...args);
};
