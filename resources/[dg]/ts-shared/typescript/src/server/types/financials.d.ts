declare namespace IFinancials {
  type AccountType = 'standard' | 'savings' | 'business';

  interface AccountMember {
    cid: number;
    access_level: number;
  }

  interface Account {
    account_id: string;
    name: string;
    type: AccountType;
    balance: number;
    members: AccountMember[];
  }

  interface Permissions {
    deposit: boolean;
    withdraw: boolean;
    transfer: boolean;
    transactions: boolean;
  }

  interface Debt {
    id: number;
    cid: number;
    target_account: string;
    debt: number;
    payed: number;
    type: 'debt' | 'maintenance';
    given_by: number;
    origin_name: string;
    date: number;
    event?: string;
    reason?: string;
    // This will prevent overdue being accounted on the fine and will set the exact date of expiration
    pay_term?: number;
  }

  interface MaintenanceFee {
    cid: number;
    target_account: string;
    debt: number;
    // Fee identifier
    reason: string;
    // Extra info about the fee
    origin: string;
  }
}