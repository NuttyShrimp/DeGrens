import { CELLS_PER_ROW } from './constants';

export const coordToPx = (coord: Inventory.XY, cellSize: number): Inventory.XY => {
  return { x: coord.x * cellSize, y: coord.y * cellSize };
};

export const getInventoryType = (id: string) => id.split('__', 2)[0];

export const generateShopItems = (
  inventoryId: string,
  shopItems: Inventory.Shop.Item[]
): { size: number; items: Inventory.State['items'] } => {
  let size = 0;
  const items: Inventory.State['items'] = {};

  const getNextPosition = (itemSize: Inventory.XY) => {
    if (Object.keys(items).length === 0) {
      size = itemSize.y;
      return { position: { x: 0, y: 0 }, rotated: false };
    }

    const occupiedSpaces = buildOccupiedGridSpaces(items, size, inventoryId);

    const maxXToCheck = CELLS_PER_ROW - Math.max(itemSize.x, itemSize.y) + 1;

    for (let y = 0; y < 1000; y++) {
      for (let x = 0; x < maxXToCheck; x++) {
        let freeSpace: { position: Inventory.XY; rotated: boolean } | undefined = undefined;
        if (areSpacesNotOccupied(occupiedSpaces, { x, y }, itemSize, false, true)) {
          freeSpace = { position: { x, y }, rotated: false };
        } else if (areSpacesNotOccupied(occupiedSpaces, { x, y }, itemSize, true, true)) {
          freeSpace = { position: { x, y }, rotated: true };
        }

        if (freeSpace) {
          const ySize = freeSpace.rotated ? itemSize.x : itemSize.y;
          if (y + ySize > size) {
            size = y + ySize;
          }
          return freeSpace;
        }
      }
    }

    return { position: { x: 0, y: 0 }, rotated: false };
  };

  for (const shopItem of shopItems) {
    const { rotated, position } = getNextPosition(shopItem.size);

    const itemData: Inventory.Item = {
      ...shopItem,
      id: `shopitem_${shopItem.name}`,
      rotated,
      inventory: inventoryId,
      position,
      quality: 100,
      metadata: {},
    };
    items[itemData.id] = itemData;
  }

  return { size, items };
};

// cannot be hook in useInventory because we use in `generateShopItems` which is a util func
export const buildOccupiedGridSpaces = (
  items: Inventory.State['items'],
  inventorySize: number,
  inventoryId: string,
  excludeItemId?: string
) => {
  const occupiedSpaces: boolean[][] = [...new Array(CELLS_PER_ROW)].map(() => new Array(inventorySize).fill(false));

  for (const item of Object.values(items)) {
    if (item.inventory !== inventoryId) continue;
    if (excludeItemId && item.id === excludeItemId) continue;

    const maxX = item.position.x + item.size[item.rotated ? 'y' : 'x'];
    const maxY = item.position.y + item.size[item.rotated ? 'x' : 'y'];
    for (let x = item.position.x; x < maxX; x++) {
      for (let y = item.position.y; y < maxY; y++) {
        occupiedSpaces[x][y] = true;
      }
    }
  }

  return occupiedSpaces;
};

export const areSpacesNotOccupied = (
  occupiedSpaces: boolean[][],
  position: Inventory.XY,
  size: Inventory.XY,
  rotated = false,
  allowOverflow = false // when using to determine shop item position, we want to allow overflow to determine inventory size
) => {
  const maxX = position.x + size[rotated ? 'y' : 'x'];
  const maxY = position.y + size[rotated ? 'x' : 'y'];
  for (let x = position.x; x < maxX; x++) {
    const column = occupiedSpaces[x];
    if (!column) return false;

    for (let y = position.y; y < maxY; y++) {
      if (column[y] || (!allowOverflow && column[y] === undefined)) return false;
    }
  }
  return true;
};
