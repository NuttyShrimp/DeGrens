declare namespace HUD {
  interface Config {
    shootingChance: number;
    speed: {
      minimum: number;
    };
    shake: {
      minimum: number;
      maxLength: number;
      maxAmount: number;
      interval: {
        min: number;
        max: number;
      };
    };
  }
}
