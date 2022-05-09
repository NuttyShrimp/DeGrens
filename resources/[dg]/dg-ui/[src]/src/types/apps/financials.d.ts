declare namespace Financials {
  type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'purchase' | 'paycheck';

  interface Transaction {
    transaction_id: string;
    origin_account_id: string;
    origin_account_name: string;
    target_account_id: string;
    target_account_name: string;
    change: number;
    comment: string;
    // here Names, serversided this will be the citizenid
    triggered_by: string;
    accepted_by: string;
    // UNIX timestamp
    date: number;
    type: TransactionType;
  }

  type AccountType = 'standard' | 'savings' | 'business';

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

  interface BaseInfo {
    cash: number;
    bank: string;
    isAtm?: boolean;
  }

  interface ModalProps {
    selected: Account;
    fetchTransactions: () => Promise<void>;
    fetchAccounts: () => Promise<void>;
  }

  interface State extends State.Base {
    transactions: Transaction[];
    accounts: Account[];
    selected: Account | null;
    openPane: boolean;
    cash: number;
    bank: string;
    isAtm: boolean;
    canLoadMore: boolean;
    backdrop: boolean;
    modalComponent: React.FC<React.PropsWithChildren<ModalProps>> | null;
  }

  interface Props extends State, State.BaseProps<State> {}
}
