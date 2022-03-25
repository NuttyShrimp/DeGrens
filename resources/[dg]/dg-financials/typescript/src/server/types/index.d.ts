declare type AccountPermission = 'deposit' | 'withdraw' | 'transfer' | 'transactions';
declare type TaxesCategory = 'No Tax' | 'Vehicles' | 'Real estate' | 'Income tax' | 'Services' | 'Goederen' | 'Gas';
declare type LoggerCategory = 'bank' | 'cash' | 'crypto' | 'debts' | 'paycheck' | 'taxes';

declare interface IAccountMember {
  cid: number;
  access_level: number;
}

declare namespace ActionData {
  interface Standard {
    accountId: string;
    amount: number;
    comment?: string;
  }

  interface Transfer extends Standard {
    target: string;
  }
}

declare interface paycheckEntry {
  cid: number;
  amount: number;
}

declare namespace NCrypto {
  interface Coin extends DB.ICrypto {
    icon: string;
  }
  interface Wallet extends Omit<DB.ICryptoWallet, 'crypto_name'> {
    cname: string;
  }
  interface Config {
    name: string;
    icon: string;
    value?: number;
  }
}

declare namespace Taxes {
  interface Tax {
    category: TaxesCategory;
    rate: number;
  }
  interface TaxedPrice {
    taxPrice: number;
    taxRate: number;
  }
  interface IncomingTax {
    price: number;
    taxId: number;
  }
}

declare namespace Debts {
  type Type = 'debt' | 'maintenance';
  interface Debt {
    id: number;
    cid: number;
    target_account: string;
    debt: number;
    type: Type;
    given_by: number;
    date?: number;
    reason?: string;
  }
}
