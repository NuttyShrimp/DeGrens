import { CELLS_PER_ROW } from './constants';

export const coordToPx = (coord: Inventory.XY, cellSize: number): Inventory.XY => {
  return { x: coord.x * cellSize, y: coord.y * cellSize };
};

export const getInventoryType = (id: string) => id.split('__', 2)[0];

export const isAnyItemOverlapping = (
  items: Pick<Inventory.Item, 'position' | 'size'>[],
  position: Inventory.XY,
  size: Inventory.XY
): boolean => {
  return items.some(i => doRectanglesOverlap(position, size, i.position, i.size));
};

export const doRectanglesOverlap = (
  movingPosition: Inventory.XY,
  movingSize: Inventory.XY,
  otherPosition: Inventory.XY,
  otherSize: Inventory.XY
): boolean => {
  return (
    movingPosition.x < otherPosition.x + otherSize.x &&
    movingPosition.x + movingSize.x > otherPosition.x &&
    movingPosition.y < otherPosition.y + otherSize.y &&
    movingPosition.y + movingSize.y > otherPosition.y
  );
};

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
    const mayOverlap = Object.values(items).map(i => ({
      position: i.position,
      size: i.size,
    }));

    for (let y = 0; y < 1000 - itemSize.y + 1; y++) {
      for (let x = 0; x < CELLS_PER_ROW - itemSize.x + 1; x++) {
        const position = { x, y };
        const anyOverlapping = isAnyItemOverlapping(mayOverlap, position, itemSize);
        if (anyOverlapping) continue;
        if (position.y + itemSize.y > size) {
          size = position.y + itemSize.y;
        }
        return position;
      }
    }
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
