export const TROLLEY_OBJECTS: Record<Trolley.Type, { trolley: number; pickup: number }> = {
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
};