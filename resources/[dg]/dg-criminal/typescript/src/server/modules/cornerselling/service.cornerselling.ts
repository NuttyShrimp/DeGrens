import { SQL, Inventory, Reputations, Util } from '@dgx/server';
import { getConfig } from 'services/config';

const salesHeatmap: Record<string, number> = {};

export const initializeCornerselling = async () => {
  await dropOldSales();
  loadSellLocations();
};

const dropOldSales = () => {
  return SQL.query('DELETE FROM cornerselling_sales WHERE date < NOW() - INTERVAL ? DAY', [
    getConfig().cornerselling.decayTime,
  ]);
};

const loadSellLocations = async () => {
  const result = await SQL.query<{ coords: string }[]>('SELECT coords FROM cornerselling_sales');
  result.forEach(x => {
    const coords = JSON.parse(x.coords);
    addSaleToHeatmap(coords);
  });
};

// Index is formatted like 'x_y'
const getSalesHeatmapIndexFromCoord = (coords: Vec2) => {
  const size = getConfig().cornerselling.heatmapSize;
  return `${Math.floor(coords.x / size)}_${Math.floor(coords.y / size)}`;
};

export const addSaleToHeatmap = (coords: Vec2) => {
  const idx = getSalesHeatmapIndexFromCoord(coords);
  const prevValue = salesHeatmap[idx] ?? 0;
  salesHeatmap[idx] = prevValue + 0.1;
};

const getValueFromSalesHeatmap = (coords: Vec2) => {
  const idx = getSalesHeatmapIndexFromCoord(coords);
  return salesHeatmap[idx] ?? 0;
};

export const getSellableItems = async (plyId: number) => {
  const cid = Util.getCID(plyId);
  const plyRep = Reputations.getReputation(cid, 'cornersell') ?? 0;

  const sellableItems = Object.entries(getConfig().cornerselling.sellableItems);
  const itemsPlayerHas: string[] = [];
  for (const [item, data] of sellableItems) {
    if (data.reputation > plyRep) continue;
    const hasItem = await Inventory.doesPlayerHaveItems(plyId, item);
    if (hasItem) {
      itemsPlayerHas.push(item);
    }
  }
  return itemsPlayerHas;
};

export const calculatePrice = (item: string, coords: Vec2) => {
  const itemPrice = getConfig().cornerselling.sellableItems[item].value;
  const multiplier = getValueFromSalesHeatmap(coords);
  return Math.floor(itemPrice * multiplier);
};
