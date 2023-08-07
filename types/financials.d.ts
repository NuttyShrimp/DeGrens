declare namespace Financials {
  namespace Debts {
    type DebtMetadata = {
      givenBy?: number;
      cbEvt?: string;
      // This will prevent overdue being accounted on the fine and will set the exact date of expiration
      payTerm?: number;
      [k: string]: any;
    };
  }
}
