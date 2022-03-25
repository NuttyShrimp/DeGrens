import { mainLogger } from '../../sv_logger';

import { Account } from './classes/Account';

export const bankLogger = mainLogger.child({ module: 'bank', category: 'bank' });

export const sortAccounts = (acc: Account[]): Account[] => {
  return acc
    .sort((a, b) => {
      if (a.getName() < b.getName()) return -1;
      if (a.getName() > b.getName()) return 1;
      return 0;
    })
    .sort((a, b) => {
      switch (b.getType()) {
        case 'standard': {
          if (a.getType() === 'standard') return 0;
          return 1;
        }
        case 'savings': {
          switch (a.getType()) {
            case 'standard': {
              return -1;
            }
            case 'savings': {
              return 0;
            }
            default: {
              return 1;
            }
          }
        }
        case 'business': {
          if (a.getType() === 'business') return 0;
          return -1;
        }
      }
    });
};

export const generateSplittedInfo = (info: Record<string, any>) => {
  let str = '';
  Object.entries(info).map(([k, v]) => (str += `${k}: ${v}`));
  return str.trim();
};

export const ActionPermission: Record<TransactionType, AccountPermission> = {
  deposit: 'deposit',
  withdraw: 'withdraw',
  transfer: 'transfer',
  mobile_transaction: 'transfer',
  paycheck: 'deposit',
  purchase: 'withdraw',
};
