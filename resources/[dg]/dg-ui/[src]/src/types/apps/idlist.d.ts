declare namespace IdList {
  interface ScopePlayer {
    source: number;
    steamId: string;
  }
  interface ScopeInfo {
    current: ScopePlayer[];
    recent: ScopePlayer[];
    dropped: ScopePlayer[];
  }
  type State = Base.State & ScopeInfo;
}
