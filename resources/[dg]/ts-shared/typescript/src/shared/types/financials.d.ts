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

  namespace Debts {
    type Type = 'debt' | 'maintenance';
    interface Debt<T = Record<string, any> | undefined> {
      id: number;
      cid: number;
      target_account: string;
      debt: number;
      payed: number;
      type: Type;
      given_by: number;
      origin_name: string;
      date: number;
      event?: string;
      reason?: string;
      pay_term?: number;
      metadata: T;
    }
  }
}
