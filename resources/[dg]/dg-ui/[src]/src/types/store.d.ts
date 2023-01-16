// Frequent store actions
declare namespace Store {
  interface UpdateStore<T extends object> {
    updateStore: (state: Partial<T> | ((s: T) => Partial<T>)) => void;
  }
  interface ResetStore {
    resetStore: () => void;
  }
}
