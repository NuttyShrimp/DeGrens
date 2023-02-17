import { UI, Util } from '@dgx/client';
import { ENABLED_KEYS } from './constants.keygame';

let activeId: string | null = null;
let activePromiseResolve: ((value: boolean) => void) | null = null;
let keyThread: NodeJS.Timer | null = null;

export const startKeygame = async (cycles: Minigames.Keygame.Cycle[]) => {
  if (activeId !== null) return;

  if (cycles.length === 0) {
    console.log('[Keygame] provided cycles array was empty');
    return false;
  }

  activeId = Util.uuidv4();
  startKeyThread();
  UI.openApplication(
    'keygame',
    {
      id: activeId,
      cycles: cycles,
    },
    true
  );
  UI.SetUIFocusCustom(true, false);

  const result = await new Promise<boolean>(res => (activePromiseResolve = res));
  return result;
};

export const finishKeygame = (id: string, success: boolean) => {
  if (id !== activeId) return;
  if (activePromiseResolve === null) return;
  activePromiseResolve(success);
  activePromiseResolve = null;
  activeId = null;
  stopKeyThread();
};

const startKeyThread = () => {
  if (keyThread !== null) return;
  global.exports['dg-lib'].shouldExecuteKeyMaps(false);
  SetPauseMenuActive(false);
  keyThread = setInterval(() => {
    DisableAllControlActions(0);
    ENABLED_KEYS.forEach(key => {
      EnableControlAction(0, key, true);
    });
  }, 0);
};

const stopKeyThread = () => {
  if (keyThread === null) return;
  global.exports['dg-lib'].shouldExecuteKeyMaps(true);
  clearInterval(keyThread);
  keyThread = null;
};

export const getActiveKeyGameId = () => activeId;
