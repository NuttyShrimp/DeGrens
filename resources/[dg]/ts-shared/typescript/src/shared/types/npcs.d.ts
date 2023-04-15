declare type NpcData = {
  id: string;
  model: string | number;
  position: Vec3;
  heading: number;
  distance: number;
  settings: Record<'invincible' | 'freeze' | 'ignore' | 'collision', boolean>;
  flags: Record<string, any>;
  clothing?: string;
  scenario?: string;
  blip?: {
    title: string;
    sprite: number;
    color: number;
    scale?: number;
  };
};
