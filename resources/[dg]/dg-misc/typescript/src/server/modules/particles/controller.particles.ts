import { Events, Util } from '@dgx/server';
import { addLoopedParticle, removeLoopedParticle } from './service.particles';

Events.onNet('particles:server:addLooped', (src, id: string, data: Misc.Particles.Data) => {
  addLoopedParticle(id, data);
});

Events.onNet('particles:server:removeLooped', (src, id: string) => {
  removeLoopedParticle(id);
});

global.exports('addParticle', (plyId: number, data: Misc.Particles.Data) => {
  if (!data.looped) {
    Events.emitNet('particles:client:add', plyId, '', data);
    return;
  }

  const id = Util.uuidv4();
  addLoopedParticle(id, data);
  return id;
});

global.exports('removeParticle', removeLoopedParticle);
