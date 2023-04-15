import { UI } from '@dgx/client';
import { forceFinishGridGame } from 'modules/gridgames/service.gridgames';
import { forceFinishKeygame } from 'modules/keygame/service.keygame';
import { forceFinishKeypad } from 'modules/keypad/service.keypad';

UI.onUIReload(() => {
  // if any game is active, return false as result
  forceFinishGridGame();
  forceFinishKeygame();
  forceFinishKeypad();
});
