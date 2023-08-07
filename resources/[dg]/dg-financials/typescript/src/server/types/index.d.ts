declare type AccountPermission = 'deposit' | 'withdraw' | 'transfer' | 'transactions';
declare type TaxesCategory = 'No Tax' | 'Vehicles' | 'Real estate' | 'Income tax' | 'Services' | 'Goederen' | 'Gas';
declare type LoggerCategory = 'bank' | 'cash' | 'crypto' | 'debts' | 'paycheck' | 'taxes';

declare interface IAccountMember {
  cid: number;
  access_level: number;
}

declare interface AccountContext {
  account_id: string;
  name: string;
  type: AccountType;
  balance: number;
  members: IAccountMember[];
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
  type Type = 'debt' | 'maintenance' | 'scheduled';
  interface Debt {
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
    metadata?: Record<string, any>;
  }
}

declare interface Config {
  accounts: {
    toSeed: {
      name: string;
      canTransfer: boolean;
      id: string;
    }[];
    defaultBalance: number;
  };
  paycheck: {
    jobs: Record<string, number>;
    default: string;
  };
  cryptoCoins: NCrypto.Config[];
  taxes: {
    cats: Taxes.Tax[];
    inflation: number;
    brackets: { tax: number; group: number }[];
  };
  debts: {
    maintenance: {
      daysBetween: number;
      hour: number;
      minute: number;
    };
    // Record of minimum debt and their time to pay it off
    debtTerms: Record<number, number>;
    // % of interest added to fine because overDue
    fineOverDueInterest: number;
    // % of interest on fine when overDue term is over
    fineDefaultInterest: number;
  };
}
