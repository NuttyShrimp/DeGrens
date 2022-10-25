declare namespace Financials {
  type AccountType = 'standard' | 'savings' | 'business';
  type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'purchase' | 'paycheck' | 'mobile_transaction';

  interface AccountPermission {
    deposit: boolean;
    withdraw: boolean;
    transfer: boolean;
    transactions: boolean;
  }

  interface Account {
    account_id: string;
    name: string;
    type: AccountType;
    balance: number;
    permissions: AccountPermission;
  }

  /**
   * Withdrawal and deposit transactions
   */
  interface BankAction {
    accountId: string;
    amount: number;
    comment?: string;
  }

  interface TransferAction extends BankAction {
    target: string;
  }
}
