import { NpmConfigSetLevels } from 'winston/lib/winston/config';

declare interface ServerConfig {
  logger: {
    level: keyof NpmConfigSetLevels;
  };
}

declare interface SharedConfig {
  trolleys: Record<Trolley.Type, { trolley: number; pickup: number }>;
}

export const clientConfig = {};

export const serverConfig: ServerConfig = {
  logger: {
    // Do not change for production or you will get spammed
    level: GetConvar('is_production', 'true') === 'true' ? 'warning' : 'silly',
  },
};

export const sharedConfig: SharedConfig = {
  trolleys: {
    cash: {
      trolley: GetHashKey('ch_prop_ch_cash_trolly_01c'),
      pickup: GetHashKey('hei_prop_heist_cash_pile'),
    },
    gold: {
      trolley: GetHashKey('ch_prop_gold_trolly_01c'),
      pickup: GetHashKey('ch_prop_gold_bar_01a'),
    },
    diamonds: {
      trolley: GetHashKey('ch_prop_diamond_trolly_01c'),
      pickup: GetHashKey('ch_prop_vault_dimaondbox_01a'),
    },
  },
};
