declare namespace Scopes {
  type Info = Sync.Scopes.Player & {
    type: Sync.Scopes.Type;
    recentTimeout?: NodeJS.Timeout;
    timestamp: number;
  };

  type Scope = Record<number, Info>;
}
