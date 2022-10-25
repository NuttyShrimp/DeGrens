import { Events, Util } from '@dgx/client';
import { addParticle, getIsLooped, removeParticle } from './service.particles';

// Looped are NOT networked by 5M, nonlooped are networked by 5M
global.exports('addParticle', (particle: Particles.Particle) => {
  const data: Required<Particles.Particle> = {
    offset: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    ...particle,
  };

  const id = Util.uuidv4();
  if (data.looped) {
    Events.emitNet('particles:server:addLooped', id, data);
  } else {
    addParticle(id, data);
  }
  return id;
});

global.exports('removeParticle', (id: string) => {
  const looped = getIsLooped(id);
  if (looped) {
    Events.emitNet('particles:server:removeLooped', id);
  } else {
    removeParticle(id);
  }
});

Events.onNet('particles:client:addLooped', (id: string, data: Required<Particles.Particle>) => {
  addParticle(id, data);
});

Events.onNet('particles:client:removeLooped', (id: string) => {
  removeParticle(id);
});
