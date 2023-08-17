declare interface ServerExports {
  inventory: {
    toggleObject: (src: number, itemId: string, toggle: boolean) => void;
    toggleAllObjects: (src: number, toggle: boolean) => void;

    setMetadataOfItem: (
      id: string,
      cb: (old: Inventory.ItemState['metadata']) => Inventory.ItemState['metadata']
    ) => void;
    setQualityOfItem: (id: string, cb: (old: number) => number) => void;
    destroyItem: (id: string) => void;

    isItemDataLoaded: () => boolean;
    getItemData: (name: string) => Inventory.ItemData;
    getAllItemData: () => Record<string, Inventory.ItemData>;

    forceUnloadInventory: (invId: string) => Promise<void>;
  };
}
