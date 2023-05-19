declare namespace IdList {
  type Data = {
    scopeInfo: Partial<Record<Sync.Scopes.Type, Sync.Scopes.Player[]>>;
    isAdmin: boolean;
    hiddenPlys: number[];
  };
}
