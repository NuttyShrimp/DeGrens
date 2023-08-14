declare interface ClientExports {
  inventory: {
    isOpen: () => boolean;
    open: (sec?: IdBuildData) => void;

    getItemData: (name: string) => Inventory.ItemData;
    getAllItemData: () => Record<string, Inventory.ItemData>;

    hasObject: () => boolean;
  };
}
