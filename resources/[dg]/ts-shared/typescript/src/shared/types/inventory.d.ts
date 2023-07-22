declare namespace Inventory {
  type Item = ItemState & ItemData;

  // dynamic item state
  type ItemState<T extends Record<string, any> = Record<string, any>> = {
    id: string;
    name: string;
    inventory: string;
    position: Vec2;
    rotated: boolean;
    hotkey: Hotkey | null;
    metadata: { hiddenKeys: string[] } & T;
    // the unix timestamp when an item is going to break (sec)
    destroyDate: number | null;
    requirements?: Requirements;
    quality?: number;
  };

  interface Requirements {
    cash?: number;
    items?: { name: string; label: string; amount: number }[];
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

  type Type =
    | 'player'
    | 'trunk'
    | 'glovebox'
    | 'drop'
    | 'dumpster'
    | 'stash'
    | 'shop'
    | 'container'
    | 'tunes'
    | 'bench';

  type UsageHandler = (src: number, state: Inventory.ItemState) => void;

  type UpdateHandlerData = {
    handler: (identifier: string, action: 'add' | 'remove', itemState: Inventory.ItemState) => void;
    item?: string;
    action?: 'add' | 'remove';
  };
}
