import { Config } from '@dgx/server';

let metadata: Heist.Metadata;

setImmediate(() => {
  metadata = Config.getConfigValue('heists.metadata');
});

export const getCamForId = (id: Heist.Id) => metadata.cams[id] ?? 0;

export const getTypeForId = (id: Heist.Id) =>
  Object.entries(metadata.type).find(([_, ids]) => ids.includes(id))?.[0] as Heist.Type | undefined;
export const getIdForType = (type: Heist.Type) => metadata.type[type] ?? [];

export const getLabelForId = (id: Heist.Id) => metadata.labels[id] ?? 'Unknown Location';
