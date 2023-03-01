import { Config, Events, Inventory, Police, RPC, Util } from '@dgx/server';
import { getConfig } from 'services/config';
import { mainLogger } from 'sv_logger';
import { canCutLocation, cutLocation } from './service.wirecutting';

RPC.register('materials:wirecutting:canCut', (src, locationId: number) => {
  return canCutLocation(locationId);
});

Events.onNet('materials:wirecutting:cut', async (src: number, locationId: number) => {
  if (!canCutLocation(locationId)) return;

  const item = await Inventory.getFirstItemOfName('player', String(Util.getCID(src)), 'bolt_cutters');
  if (!item) return;

  const { qualityDecrease, itemAmount } = getConfig().wirecutting;
  Inventory.setQualityOfItem(item.id, oldQuality => oldQuality - qualityDecrease);
  Inventory.addItemToPlayer(src, 'material_copper', itemAmount);
  cutLocation(locationId);
  Util.Log('materials:wirecutting:cut', { locationId }, `${Util.getName(src)} has cut wires`, src);
  mainLogger.info(`wire location ${locationId} has been cut by ${src}`);
});

Events.onNet('materials:wirecutting:dispatch', (src: number, locationId: number) => {
  const rng = Util.getRndInteger(1, 101);
  const callChance = Config.getConfigValue('dispatch.callChance.wirecutting');
  if (rng > callChance) return;

  const coords = getConfig().wirecutting.locations[locationId];
  Police.createDispatchCall({
    tag: '10-31',
    title: 'Verdachte activiteit aan treinspoor',
    description: 'Er is een verdachte persoon gespot bij de bovenleiding van een treinspoor',
    coords,
    criminal: src,
    blip: {
      sprite: 253,
      color: 11,
    },
  });
});
