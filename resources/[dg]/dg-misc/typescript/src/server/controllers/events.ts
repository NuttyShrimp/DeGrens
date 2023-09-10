import { Auth, BaseEvents } from '@dgx/server';
import { dispatchHudConfigToPlayer } from 'modules/hud/service.hud';
import { handleParticlesModuleResourceStop } from 'modules/particles/service.particles';

Auth.onAuth(plyId => {
  dispatchHudConfigToPlayer(plyId);
});

BaseEvents.onResourceStop(() => {
  handleParticlesModuleResourceStop();
});
