let config: Config | null = null;

export const getConfig = () => {
  if (config === null) {
    throw new Error('Could not get financials config');
  }
  return config;
};

export const setConfig = (cfg: Config) => {
  config = cfg;
};
