declare namespace IdList {
  interface ScopePlayer {
    source: number;
    steamId: string;
  }
  type ScopeInfo = Record<string, ScopePlayer[]>;
}
