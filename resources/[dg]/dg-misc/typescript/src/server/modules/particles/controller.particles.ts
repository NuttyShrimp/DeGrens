import { Events } from '@dgx/server';
import { addLoopedParticle, removeLoopedParticle, sendToClosePlayers } from './service.particles';

Events.onNet('particles:server:addLooped', (src: number, id: string, data: Required<Particles.Particle>) => {
  const success = addLoopedParticle(id, data);
  if (!success) return;
  sendToClosePlayers(id, data);
});

Events.onNet('particles:server:removeLooped', (src: number, id: string) => {
  removeLoopedParticle(id);
  Events.emitNet('particles:client:removeLooped', -1, id);
});
