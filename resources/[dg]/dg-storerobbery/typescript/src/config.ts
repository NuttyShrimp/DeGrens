import { NpmConfigSetLevels } from 'winston/lib/winston/config';

declare interface Serverconfig {
  logger: {
    level: keyof NpmConfigSetLevels;
  };
}

export const clientConfig = {};

export const serverConfig: Serverconfig = {
  logger: {
    // Do not change for production or you will get spammed
    level: GetConvar('is_production', 'true') === 'true' ? 'warning' : 'silly',
  },
};
