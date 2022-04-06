import { AccountManager } from './modules/bank/classes/AccountManager';

export const generateAccountId = (): string => {
  const manager = AccountManager.getInstance();
  let id = `BE${DGX.Util.getRndInteger(11111111, 99999999)}`;
  while (manager.getAccountById(id)) {
    id = generateAccountId();
  }
  return id;
};

export const generateTransactionId = (): string => {
  const manager = AccountManager.getInstance();
  let transId = DGX.Util.uuidv4();
  while (manager.doesTransactionExist(transId)) {
    transId = DGX.Util.uuidv4();
  }
  return transId;
};
