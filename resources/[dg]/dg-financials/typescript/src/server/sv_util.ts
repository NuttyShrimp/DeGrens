import { getRndInteger } from '@ts-shared/shared/functions';
import { uuidv4 } from 'fivem-js';

import { AccountManager } from './modules/bank/classes/AccountManager';

export const generateAccountId = (): string => {
  const manager = AccountManager.getInstance();
  let id = `BE${getRndInteger(11111111, 99999999)}`;
  while (manager.getAccountById(id)) {
    id = generateAccountId();
  }
  return id;
};

export const generateTransactionId = (): string => {
  const manager = AccountManager.getInstance();
  let transId = uuidv4();
  while (manager.doesTransactionExist(transId)) {
    transId = uuidv4();
  }
  return transId;
};
