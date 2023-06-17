import { Auth } from '@dgx/server';
import { dispatchHudConfigToPlayer } from 'modules/hud/service.hud';

Auth.onAuth(plyId => {
  dispatchHudConfigToPlayer(plyId);
});
