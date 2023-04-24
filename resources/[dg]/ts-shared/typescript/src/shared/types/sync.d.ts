declare namespace Sync {
  interface ScopePlayer {
    source: number;
    steamId: string;
  }

  type ActionHandler = (entity: number, ...args: any[]) => void;
}
