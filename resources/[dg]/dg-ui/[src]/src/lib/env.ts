export const isDevel = () => {
  return import.meta.env.MODE === 'development';
};

export const isGameDevel = () => {
  return import.meta.env.VITE_GAME_ENV === 'development';
};

export const debug = (...params: any[]) => {
  if (import.meta.env.VITE_GAME_ENV === 'production') return;
  console.log(...params);
};
