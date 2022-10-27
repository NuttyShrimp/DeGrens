import { UI, Util } from '@dgx/client';

let activeId: string | null = null;
let activePromiseResolve: ((value: boolean) => void) | null = null;

export const startGridGame = async (gameData: Minigames.GridGame.GenericGameData) => {
  if (activeId !== null) return;

  activeId = Util.uuidv4();
  UI.openApplication('gridgame', {
    id: activeId,
    ...gameData,
  });

  const result = await new Promise<boolean>(res => (activePromiseResolve = res));
  return result;
};

export const finishGridGame = (id: string, success: boolean) => {
  if (id !== activeId) return;
  if (activePromiseResolve === null) return;
  activePromiseResolve(success);
  activePromiseResolve = null;
  activeId = null;
};

export const getActiveGridGameId = () => activeId;
