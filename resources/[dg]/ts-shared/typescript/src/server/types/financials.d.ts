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
}
