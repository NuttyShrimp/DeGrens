import { Events, Statebags, Util } from '@dgx/client';
import { createParticle, handleEntityPtfxStateChange, removeParticle } from './service.particles';

// Nonlooped are networked, looped are not
global.exports('addParticle', (data: Misc.Particles.Data) => {
  if (!data.looped) {
    createParticle('', data); // id doesnt matter for nonlooped
    return;
  }

  const id = Util.uuidv4();
  Events.emitNet('particles:server:addLooped', id, data);
  return id;
});

global.exports('removeParticle', (id: string) => {
  Events.emitNet('particles:server:removeLooped', id);
});

Events.onNet('particles:client:add', createParticle);
Events.onNet('particles:client:remove', removeParticle);

Statebags.addEntityStateBagChangeHandler<Record<string, Misc.Particles.Data>>('entity', 'ptfx', (_, entity, ptfx) => {
  handleEntityPtfxStateChange(entity, ptfx);
});
