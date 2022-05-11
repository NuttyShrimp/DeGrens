interface NpcData {
  id: string;
  model: number;
  position: Vec3;
  heading: number;
  distance: number;
  settings: Settings.Setting[];
  flags: Flag[];
  clothing?: string;
  scenario?: string;
}

declare namespace Settings {
  type Type = 'invincible' | 'ignore' | 'freeze' | 'collision';

  type Setting = {
    type: Type;
    active: boolean;
  };
}

type Flag = {
  name: string;
  active: boolean;
};
