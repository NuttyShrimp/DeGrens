import { CELLS_PER_ROW } from './constants';

export const coordToPx = (coord: Inventory.XY, cellSize: number): Inventory.XY => {
  return { x: coord.x * cellSize, y: coord.y * cellSize };
};

export const getInventoryType = (id: string) => id.split('__', 2)[0];

export const isAnyItemOverlapping = (
  items: [Inventory.XY, Inventory.XY][],
  item: [Inventory.XY, Inventory.XY]
): boolean => {
  return items.some(i => doRectanglesOverlap(i, item));
};

const doRectanglesOverlap = (
  [firstRectangle1, firstRectangle2]: [Inventory.XY, Inventory.XY],
  [secondRectangle1, secondRectangle2]: [Inventory.XY, Inventory.XY]
): boolean =>
  firstRectangle1.x < secondRectangle2.x &&
  firstRectangle2.x > secondRectangle1.x &&
  firstRectangle1.y < secondRectangle2.y &&
  firstRectangle2.y > secondRectangle1.y;

export const generateShopItems = (
  inventoryId: string,
  shopItems: Inventory.Shop.Item[]
): { size: number; items: Inventory.OpeningData['items'] } => {
  let size = 0;
  const items: Inventory.OpeningData['items'] = {};

  const getNextPosition = (itemSize: Inventory.XY) => {
    if (Object.keys(items).length === 0) {
      size = itemSize.y;
      return { x: 0, y: 0 };
    }

    const mayOverlap = Object.values(items).map(
      i => [i.position, { x: i.position.x + i.size.x, y: i.position.y + i.size.y }] as [Inventory.XY, Inventory.XY]
    );

    for (let y = 0; y < 1000 - itemSize.y + 1; y++) {
      for (let x = 0; x < CELLS_PER_ROW - itemSize.x + 1; x++) {
        const rect = [
          { x, y },
          { x: x + itemSize.x, y: y + itemSize.y },
        ] as [Inventory.XY, Inventory.XY];
        const anyOverlapping = isAnyItemOverlapping(mayOverlap, rect);
        if (anyOverlapping) continue;
        if (y + itemSize.y > size) {
          size = y + itemSize.y;
        }
        return { x, y };
      }
    }

    return { x: 0, y: 0 };
  };

  for (const shopItem of shopItems) {
    const itemData: Inventory.Item = {
      ...shopItem,
      id: `shopitem_${shopItem.name}`,
      inventory: inventoryId,
      position: getNextPosition(shopItem.size),
      quality: 100,
      metadata: {},
    };
    items[itemData.id] = itemData;
  }

  return { size, items };
};
