declare namespace Scopes {
  type Type = 'current' | 'recent' | 'dropped';

  type Scope = Record<number, Info>;

  type Info = {
    source: number;
    steamId: string;
    type: Type;
    recentTimeout?: NodeJS.Timeout;
  };
}
