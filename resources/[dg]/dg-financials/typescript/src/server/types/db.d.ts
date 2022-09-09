declare namespace DB {
  interface IAccount {
    account_id: string;
    name: string;
    type: AccountType;
    balance: number;
    members: string;
    updated_at: number;
  }

  interface ITransaction {
    transaction_id: string;
    origin_account_id: string;
    target_account_id: string;
    change: number;
    comment: string;
    // represents CID of user on server, client its full name
    triggered_by: number;
    accepted_by: number;
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
}
