import { Config, Events } from '@dgx/server';

let noDropZones: Zones.Zone[] = [];

export const loadNoDropZones = async () => {
  await Config.awaitConfigLoad();
  noDropZones = Config.getConfigValue<Zones.Zone[]>('inventory.nodropzones');
};

export const dispatchNoDropZonesToClient = (plyId: number) => {
  Events.emitNet('inventory:nodropzones:build', plyId, noDropZones);
};
