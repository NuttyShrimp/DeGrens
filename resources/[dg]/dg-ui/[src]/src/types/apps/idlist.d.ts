declare namespace IdList {
  interface ScopePlayer {
    source: number;
    steamId: string;
  }
  interface ScopeInfo {
    current: ScopePlayer[];
    recent: ScopePlayer[];
  }
  type State = ScopeInfo;
  interface StateActions {
    setList: (data: ScopeInfo) => void;
  }
}
