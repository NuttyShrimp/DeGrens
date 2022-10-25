export const getCurrentEnv = () =>
  GetConvar('is_production', 'true') === 'false' ? 'development' : process.env.NODE_ENV ?? 'development';

export const isDevEnv = () => getCurrentEnv() === 'development';
