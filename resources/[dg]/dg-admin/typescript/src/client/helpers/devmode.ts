let devModeEnabled = false;

export const isDevModeEnabled = () => devModeEnabled;

export const setDevModeEnabled = (toggle: boolean) => {
  devModeEnabled = toggle;
};
