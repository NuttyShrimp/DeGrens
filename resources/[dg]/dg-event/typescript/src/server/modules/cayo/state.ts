let cayoEnabled = false;

export const toggleCayo = (toggle: boolean) => {
  cayoEnabled = toggle;
};

export const isCayoEnabled = () => cayoEnabled;
