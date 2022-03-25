import { NpmConfigSetLevels } from 'winston/lib/winston/config';

declare interface Config {
  logger: {
    level: keyof NpmConfigSetLevels;
    disabled: LoggerCategory[];
  };
  accounts: {
    toSeed: {
      name: string;
      canTransfer: boolean;
    }[];
    transactionLimit: number;
    defaultBalance: number;
  };
  paycheck: {
    whitelisted: Record<string, number>;
  };
  crypto: {
    coins: NCrypto.Config[];
  };
  taxes: {
    cats: Taxes.Tax[];
  };
  debts: {
    maintenance: {
      hour: number;
      minute: number;
    };
    // Amount of days to pay the debt
    finePayTerm: number;
    // % of interest on fine over pay term
    fineInterest: number;
  };
}

export const config: Config = {
  logger: {
    // Do not change for production or you will get spammed
    level: GetConvar('is_production', 'true') === 'true' ? 'warning' : 'silly',
    disabled: [],
  },
  accounts: {
    transactionLimit: 30,
    defaultBalance: 4500,
    toSeed: [
      {
        name: 'De Staat',
        canTransfer: false,
      },
      {
        name: 'Politie DeGrens',
        canTransfer: true,
      },
      {
        name: 'AZDG',
        canTransfer: true,
      },
    ],
  },
  paycheck: {
    // Paycheck registered every minute
    whitelisted: {
      police: 5,
      ambulance: 5,
      realestate: 5,
    },
  },
  crypto: {
    coins: [
      // Dark market coin
      {
        name: 'Manera',
        icon: 'mdi-alpha-m-circle-outline',
        value: 200,
      },
      // Racing coin
      {
        name: 'Suliro',
        icon: 'mdi-alpha-s',
      },
    ],
  },
  taxes: {
    cats: [
      { category: 'No Tax', rate: 0 },
      { category: 'Vehicles', rate: 11 },
      { category: 'Real estate', rate: 10 },
      { category: 'Income tax', rate: 9 },
      { category: 'Services', rate: 7 },
      { category: 'Goederen', rate: 7 },
      { category: 'Gas', rate: 6 },
    ],
  },
  debts: {
    maintenance: {
      hour: 5,
      minute: 0,
    },
    finePayTerm: 7,
    fineInterest: 10,
  },
};
