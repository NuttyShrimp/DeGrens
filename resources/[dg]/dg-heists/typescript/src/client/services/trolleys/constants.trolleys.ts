import { Util } from '@dgx/client';

export const TROLLEY_OBJECTS: Record<Trolley.Type, { trolley: number; pickup: number }> = {
  cash: {
    trolley: Util.getHash('ch_prop_ch_cash_trolly_01c'),
    pickup: Util.getHash('hei_prop_heist_cash_pile'),
  },
  gold: {
    trolley: Util.getHash('ch_prop_gold_trolly_01c'),
    pickup: Util.getHash('ch_prop_gold_bar_01a'),
  },
  diamonds: {
    trolley: Util.getHash('ch_prop_diamond_trolly_01c'),
    pickup: Util.getHash('ch_prop_vault_dimaondbox_01a'),
  },
};
