import { Events } from '@dgx/server';

const npcs = new Map<string, NpcData>();
const configNpcIds = new Set<string>(); // ids of npc that got added from config, these get removed when config gets reloaded

export const addConfigNpcs = (npcData: NpcData[]) => {
  // remove all existing config npcs that are no longer in config
  const removeIds: string[] = [];
  for (const [_, { id: existingNpcId }] of npcs) {
    if (!configNpcIds.has(existingNpcId)) continue; // if existing npc is not from config, dont care bout this one
    if (npcData.some(x => x.id === existingNpcId)) continue; // if existing config npc has new data in new config then skip
    removeIds.push(existingNpcId);
    npcs.delete(existingNpcId);
    configNpcIds.delete(existingNpcId);
  }

  npcData.forEach(x => {
    npcs.set(x.id, x);
    configNpcIds.add(x.id);
  });

  Events.emitNet('npcs:client:update', -1, {
    add: npcData,
    remove: removeIds,
  });
};

export const addNpc = (npcData: NpcData | NpcData[]) => {
  if (Array.isArray(npcData)) {
    npcData.forEach(x => npcs.set(x.id, x));
  } else {
    npcs.set(npcData.id, npcData);
  }

  Events.emitNet('npcs:client:update', -1, { add: npcData });
};

export const removeNpc = (id: string | string[]) => {
  if (Array.isArray(id)) {
    id.forEach(x => npcs.delete(x));
  } else {
    npcs.delete(id);
  }

  Events.emitNet('npcs:client:update', -1, { remove: id });
};

export const dispatchAllNpcsToClient = (plyId: number) => {
  Events.emitNet('npcs:client:update', plyId, { add: [...npcs.values()] });
};
