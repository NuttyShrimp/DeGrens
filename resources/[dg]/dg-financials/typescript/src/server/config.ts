declare interface SrvConfig {
  logger: {
    disabled: LoggerCategory[];
  };
  accounts: {
    transactionLimit: number;
  };
}

export const config: SrvConfig = {
  logger: {
    disabled: [],
  },
  accounts: {
    transactionLimit: 30,
  },
};
