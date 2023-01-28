import { NpmConfigSetLevels } from 'winston/lib/winston/config';

declare interface ServerConfig {
  logger: {
    level: keyof NpmConfigSetLevels;
  };
}

export const clientConfig = {};

export const serverConfig: ServerConfig = {
  logger: {
    // Do not change for production or you will get spammed
    level: GetConvar('is_production', 'true') === 'true' ? 'warning' : 'silly',
  },
};
