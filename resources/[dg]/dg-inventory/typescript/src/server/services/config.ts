let config: InventoryConfig | null;
export const getConfig = () => {
  if (config === null) {
    throw new Error('Tried to get inventory config but was not loaded yet');
  }
  return config;
};

export const setConfig = (data: InventoryConfig) => {
  config = data;
};
