declare namespace NBlip {
  interface Settings {
    sprite?: number;
    color?: number;
    scale?: number;
    heading?: boolean;
    category?: number;
    text?: string | (() => string);
    shortRange?: boolean;
  }

  type Type = 'player' | 'entity';

  type Mode = 'entity' | 'coords';
}
