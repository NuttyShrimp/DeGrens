import { NpmConfigSetLevels } from 'winston/lib/winston/config';

declare interface Serverconfig {
  logger: {
    level: keyof NpmConfigSetLevels;
  };
  bennys: {
    // Time that a full repair from 0 would take in MS
    fullTaskBarTime: number;
    taxId: number;
  };
}

export const clientConfig = {};

export const serverConfig: Serverconfig = {
  logger: {
    // Do not change for production or you will get spammed
    level: GetConvar('is_production', 'true') === 'true' ? 'warning' : 'silly',
  },
  bennys: {
    fullTaskBarTime: 35000,
    taxId: 6, // 6 is 'Goederen'
  },
};
