import { Events } from '@dgx/server';

const activeParticles: Map<string, Misc.Particles.Data> = new Map();

export const addLoopedParticle = (id: string, data: Misc.Particles.Data) => {
  if (activeParticles.has(id)) return;

  if ('netId' in data) {
    const entity = NetworkGetEntityFromNetworkId(data.netId);
    if (!entity || !DoesEntityExist(entity)) return;

    const entState = Entity(entity).state;
    const existingPtfx: Record<string, Misc.Particles.Data> = entState.ptfx ?? {};
    existingPtfx[id] = data;
    entState.set('ptfx', existingPtfx, true);
  } else {
    // we are better of sending it once to all clients, than to start thread and send to only close clients
    Events.emitNet('particles:client:add', -1, id, data);
  }

  activeParticles.set(id, data);
};

export const removeLoopedParticle = (id: string) => {
  const data = activeParticles.get(id);
  if (!data) return;

  if ('netId' in data) {
    const entity = NetworkGetEntityFromNetworkId(data.netId);
    if (!entity || !DoesEntityExist(entity)) return;

    const entState = Entity(entity).state;
    const existingPtfx: Record<string, Misc.Particles.Data> = entState.ptfx ?? {};
    delete existingPtfx[id];
    entState.set('ptfx', existingPtfx, true);
  } else {
    Events.emitNet('particles:client:remove', -1, id);
  }

  activeParticles.delete(id);
};

// clear all entity states on resource stop
export const handleParticlesModuleResourceStop = () => {
  for (const [_, data] of activeParticles) {
    if (!('netId' in data)) continue;
    const entity = NetworkGetEntityFromNetworkId(data.netId);
    if (!entity || !DoesEntityExist(entity)) continue;
    Entity(entity).state.set('ptfx', {}, true);
  }
};
