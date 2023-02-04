import { Events, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';

const activeLoopedParticles: Map<string, Required<Particles.Particle>> = new Map();

// Every 10s, send event to players who are in range for all particles
export const startParticleThread = () => {
  setInterval(() => {
    const toBeRemoved: string[] = [];

    activeLoopedParticles.forEach((data, id) => {
      // Check if entity still exists
      if ('netId' in data) {
        const entity = NetworkGetEntityFromNetworkId(data.netId);
        if (!entity || !DoesEntityExist(entity)) {
          toBeRemoved.push(id);
          mainLogger.silly('Registered particle has been removed because entity does not exist');
        }
      }
      sendToClosePlayers(id, data);
    });

    toBeRemoved.forEach(id => {
      removeLoopedParticle(id);
    });
  }, 1000 * 10);
};

export const addLoopedParticle = (id: string, data: Required<Particles.Particle>): boolean => {
  if (activeLoopedParticles.has(id)) return false;
  activeLoopedParticles.set(id, data);
  return true;
};

export const removeLoopedParticle = (id: string) => {
  activeLoopedParticles.delete(id);
};

export const sendToClosePlayers = (id: string, data: Required<Particles.Particle>) => {
  const coords = 'coords' in data ? data.coords : Util.getEntityCoords(NetworkGetEntityFromNetworkId(data.netId));

  for (const plyId of Util.getAllPlayers()) {
    if (Util.getPlyCoords(plyId).distance(coords) > 100) continue;
    Events.emitNet('particles:client:addLooped', plyId, id, data);
  }
};
