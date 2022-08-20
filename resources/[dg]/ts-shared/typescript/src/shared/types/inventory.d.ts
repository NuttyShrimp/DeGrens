declare namespace Inventory {
  type Item = ItemState & ItemData;

  // dynamic item state
  interface ItemState {
    id: string;
    name: string;
    inventory: string;
    position: Vec2;
    quality: number;
    hotkey: Hotkey | null;
    metadata: { [key: string]: any };
    lastDecayTime: number;
    requirements?: Requirements;
  }

  interface Requirements {
    cash?: number;
    items?: { name: string; label: string }[];
  }

  // static item data
  interface ItemData {
    name: string;
    label: string;
    image: string;
    size: Vec2;
    decayRate?: number;
    description?: string;
    useable?: boolean;
    closeOnUse?: boolean;
    markedForSeizure?: boolean;
  }

  type Hotkey = 1 | 2 | 3 | 4 | 5;

  type Type = 'player' | 'trunk' | 'glovebox' | 'drop' | 'dumpster' | 'stash' | 'shop' | 'container';

  type UsageHandler = (src: number, state: Inventory.ItemState) => void;
}
