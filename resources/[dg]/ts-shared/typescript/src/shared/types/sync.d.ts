declare namespace Sync {
  namespace Scopes {
    type Type = 'current' | 'recent' | 'dropped';

    type Player = {
      source: number;
      steamId: string;
    };

    type PlayerScope = Record<Type, Player[]>;
  }

  type ActionHandler = (entity: number, ...args: any[]) => void;
}
