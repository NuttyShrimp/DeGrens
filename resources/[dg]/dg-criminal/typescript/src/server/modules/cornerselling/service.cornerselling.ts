import { SQL, Inventory, Reputations, Util } from '@dgx/server';
import config from 'services/config';

const salesHeatmap: Record<string, number> = {};

export const initializeCornerselling = async () => {
  await dropOldSales();
  loadSellLocations();
};

const dropOldSales = () => {
  return SQL.query('DELETE FROM cornerselling_sales WHERE date < NOW() - INTERVAL ? DAY', [
    config.cornerselling.decayTime,
  ]);
};

const loadSellLocations = async () => {
  const result = await SQL.query<{ zone: string }[]>('SELECT zone FROM cornerselling_sales');
  result.forEach(x => {
    addSaleToHeatmap(x.zone);
  });
};

export const addSaleToHeatmap = (zone: string) => {
  const prevModifier = salesHeatmap[zone];
  const newModifier = (prevModifier ?? 1) + config.cornerselling.modifierIncreasePerSale;
  salesHeatmap[zone] = Math.min(config.cornerselling.maxModifier, newModifier);
};

const getModifierFromSalesHeatmap = (zone: string) => {
  let modifier = (salesHeatmap[zone] ??= 1);
  return modifier;
};

export const getSellableItems = async (plyId: number) => {
  const cid = Util.getCID(plyId);
  const plyRep = Reputations.getReputation(cid, 'cornersell') ?? 0;

  const sellableItems = Object.entries(config.cornerselling.sellableItems);
  const itemsPlayerHas: string[] = [];
  for (const [item, data] of sellableItems) {
    if (data.requiredReputation > plyRep) continue;
    const hasItem = await Inventory.doesPlayerHaveItems(plyId, item);
    if (hasItem) {
      itemsPlayerHas.push(item);
    }
  }
  return itemsPlayerHas;
};

export const calculatePrice = (item: string, zone: string) => {
  const basePrice = config.cornerselling.sellableItems[item].basePrice;
  const modifier = getModifierFromSalesHeatmap(zone);
  return Math.floor(basePrice * modifier);
};
