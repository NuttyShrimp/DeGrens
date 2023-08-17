declare namespace AnimLoops {
  type Anim = {
    animation: {
      dict: string;
      name: string;
      flag: number;
    };
    weight?: number; // this determines which anim gets played if multiple are active
    disableFiring?: boolean;
  } & ({ disabledControls?: number[] } | { disableAllControls?: boolean; enabledControls?: number[] });

  type Active = Required<Pick<Anim, 'disableFiring' | 'animation' | 'weight'>> & {
    disabledControls: Set<number>;
    enabledControls: Set<number>;
    disableAllControls: boolean;
  };
}
