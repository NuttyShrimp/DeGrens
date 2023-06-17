declare namespace Stances {
  type Wheel = 'frontLeft' | 'frontRight' | 'backLeft' | 'backRight';

  type Stance = Record<Wheel, number>;

  type Config = Record<string, Model>;

  type Model = {
    defaultStance: Stance;
    upgrade: {
      component: Vehicles.Upgrades.Cosmetic.Key;
      possibilities: {
        value: number | number[];
        stance: Stance;
      }[];
    };
  };
}
