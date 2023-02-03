declare namespace IdList {
  type Data = {
    scopeInfo: {
      current: Sync.ScopePlayer[];
      recent: Sync.ScopePlayer[];
    };
    isAdmin: boolean;
    hiddenPlys: number[];
  };
}
