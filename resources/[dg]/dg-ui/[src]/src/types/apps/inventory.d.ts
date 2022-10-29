declare namespace Inventory {
  interface State extends Base.State {
    items: Record<string, Item>;
    inventories: {
      [key: string]: PrimarySide | SecondarySide;
    };
    primaryId: string;
    secondaryId: string;
  }

  interface OpeningData {
    items: Record<string, Item>;
    primary: Omit<PrimarySide, 'side'>;
    secondary: Omit<SecondarySide, 'side'>;
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
    position: XYCoord;
    size: XYCoord;
    name: string;
    label: string;
    quality: number;
    image: string;
    description?: string;
    useable?: boolean;
    closeOnUse?: boolean;
    hotkey?: number;
    markedForSeizure?: boolean;
    metadata: { [key: string]: any };
    requirements?: ItemRequirements;
  }

  interface ItemRequirements {
    cash?: number;
    items?: { name: string; label: string }[];
  }

  interface Alert {
    message: string;
    type: 'success' | 'error';
  }
}
