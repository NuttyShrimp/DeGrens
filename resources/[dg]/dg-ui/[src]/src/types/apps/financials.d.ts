declare namespace Financials {
  type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'purchase' | 'paycheck';

  interface Transaction {
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
    members?: PermissionsMember[];
  }

  interface BaseInfo {
    cash: number;
    bank: string;
    isAtm?: boolean;
  }

  interface ModalProps {
    account: Account;
    fetchTransactions: (accountId?: string, reset?: boolean) => Promise<void>;
    fetchAccounts: () => Promise<void>;
  }

  interface State {
    transactions: Transaction[];
    accounts: Account[];
    selected: Account | null;
    openPane: boolean;
    cash: number;
    bank: string;
    isAtm: boolean;
    canLoadMore: boolean;
    backdrop: boolean;
    modalComponent: React.ReactElement<any, any> | null;
  }

  interface StateActions {
    setModal: (modal: React.ReactElement<any, any> | null) => void;
    openLoaderModal: () => void;
    closeModal: () => void;
  }

  type PermissionsMember = { cid: number; name: string } & AccountPermission;
}
