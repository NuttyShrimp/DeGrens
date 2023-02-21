declare namespace Inventory {
  type XY = { x: number; y: number };

  interface State {
    items: Record<string, Item>;
    inventories: {
      [key: string]: PrimarySide | SecondarySide;
    };
    primaryId: string;
    secondaryId: string;
  }

  interface StateActions {
    updateItem: (item: Item | ((items: Record<string, Item>) => Item)) => void;
    deleteItem: (id: string) => void;
  }

  interface OpeningData {
    items: Record<string, Item>;
    primary: PrimarySide;
    secondary: SecondarySide | (Pick<Grid, 'id'> & { shopItems: Inventory.Shop.Item[] });
  }

  type PrimarySide = Omit<Grid, 'items'>;
  type SecondarySide = Omit<Grid, 'items'> & { allowedItems?: string[] };

  interface Grid {
    id: string;
    size: number;
    items: string[];
  }

  interface Item {
    id: string;
    inventory: string;
    position: XY;
    size: XY;
    rotated: boolean;
    name: string;
    label: string;
    quality?: number;
    image: string;
    description?: string;
    useable?: boolean;
    closeOnUse?: boolean;
    hotkey?: number;
    markedForSeizure?: boolean;
    metadata: { [key: string]: any };
    // These two get used in shops
    requirements?: Shop.Requirements;
    amount?: number;
  }

  interface Alert {
    message: string;
    type: 'success' | 'error';
  }

  namespace Shop {
    type Item = Required<Pick<Inventory.Item, 'size' | 'name' | 'label' | 'image' | 'amount' | 'requirements'>>;

    type Requirements = {
      cash?: number;
      items?: { name: string; label: string; amount: number }[];
    };
  }
}
