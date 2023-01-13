declare namespace Scopes {
  type ClientType = 'current' | 'recent';
  type Type = ClientType | 'dropped';

  type Player = {
    source: number;
    steamId: string;
  };

  type Info = Player & {
    type: Type;
    recentTimeout?: NodeJS.Timeout;
    timestamp: number;
  };

  type Scope = Record<number, Info>;
}
