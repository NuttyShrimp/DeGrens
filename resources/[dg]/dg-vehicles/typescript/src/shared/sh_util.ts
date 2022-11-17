import { Util } from '@dgx/server';

export const getCurrentEnv = () => (Util.isDevEnv() ? 'development' : process.env.NODE_ENV ?? 'development');
