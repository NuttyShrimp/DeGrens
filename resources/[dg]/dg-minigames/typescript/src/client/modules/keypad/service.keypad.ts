import { UI, Util } from '@dgx/client';
import { DEFAULT_BUTTONS } from './constants.keypad';

let active: { id: string; solution: string; resolve: (success: boolean) => void } | null = null;

export const openKeypad = async (gameData: Minigames.Keypad.Data) => {
  if (active !== null) return;

  const id = Util.uuidv4();
  UI.openApplication('keypad', {
    id,
    buttons: gameData.buttons ?? DEFAULT_BUTTONS,
  });

  const result = await new Promise<boolean>(res => {
    active = {
      id,
      solution: gameData.solution,
      resolve: res,
    };
  });
  return result;
};

export const finishKeypad = (id: string, inputs: string[]) => {
  if (active === null || active.id !== id) return;

  const success = inputs.join('') === active.solution;
  active.resolve(success);

  active = null;
};

export const forceFinishKeypad = () => {
  if (active === null) return;
  active.resolve(false);
  active = null;
};
