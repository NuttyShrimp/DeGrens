import { Util } from '@dgx/server';
import accountManager from './modules/bank/classes/AccountManager';

export const generateAccountId = (): string => {
  let id = `BE${Util.getRndInteger(11111111, 99999999)}`;
  if (accountManager.getAccountById(id)) {
    id = generateAccountId();
  }
  return id;
};

export const generateTransactionId = (): string => {
  let transId = Util.uuidv4();
  while (accountManager.doesTransactionExist(transId)) {
    transId = Util.uuidv4();
  }
  return transId;
};
