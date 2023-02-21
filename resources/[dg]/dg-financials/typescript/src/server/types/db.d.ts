declare namespace DB {
  interface IAccount {
    account_id: string;
    name: string;
    type: AccountType;
    balance: number;
    members: string;
    updated_at: number;
  }

  // Some can be null if the target got deleted in db
  interface ITransaction {
    transaction_id: string;
    origin_account_id: string;
    origin_account_name: string;
    origin_change: number;
    target_account_id: string;
    target_account_name: string;
    target_change: number;
    comment: string;
    triggered_by: string;
    accepted_by: string | null;
    // UNIX timestamp
    date: number;
    type: TransactionType;
  }

  interface ICrypto {
    crypto_name: string;
    value: number;
  }

  interface ICryptoWallet {
    cid: number;
    crypto_name: string;
    amount: number;
  }

  interface IMaintenanceLog {
    id: number;
    date: number;
  }
}
