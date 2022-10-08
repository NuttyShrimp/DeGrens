declare type AccountType = 'standard' | 'savings' | 'business';
declare type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'purchase' | 'paycheck' | 'mobile_transaction';

declare interface BaseState {
  cash: number;
  bank: string;
  isAtm?: boolean;
}

declare interface IAccountPermission {
  deposit: boolean;
  withdraw: boolean;
  transfer: boolean;
  transactions: boolean;
}

interface IAccount {
  account_id: string;
  name: string;
  type: AccountType;
  balance: number;
  permissions: IAccountPermission;
  // Only provided if type is 'savings'
  members?: SavingAccountsMember[];
}

declare type SavingAccountsMember = { cid: number; name: string } & IAccountPermission;
