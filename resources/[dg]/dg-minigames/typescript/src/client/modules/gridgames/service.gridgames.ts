import { UI, Util } from '@dgx/client';

let active: { id: string; resolve: (value: boolean) => void } | null = null;

export const startGridGame = async (gameData: Minigames.GridGame.GenericGameData) => {
  if (active !== null) return;

  const id = Util.uuidv4();
  UI.openApplication('gridgame', {
    id,
    ...gameData,
  });

  const result = await new Promise<boolean>(res => {
    active = { id, resolve: res };
  });
  return result;
};

export const finishGridGame = (id: string, success: boolean) => {
  if (active === null || active.id !== id) return;

  active.resolve(success);
  active = null;
};

export const forceFinishGridGame = () => {
  if (active === null) return;
  active.resolve(false);
  active = null;
};
