declare namespace Paleto {
  type Config = {
    code: {
      resetTime: number; // minutes
      lockdownTime: number; // minutes
      price: number;
    };
    emp: {
      gridSize: number;
      length: number;
      time: number;
    };
    safe: {
      delay: 30; // minutes
      qualityDecrease: 25;
    };
    actions: {
      coords: Vec3;
      size: number;
      id: string;
      standaloneAction?: boolean; // use for actions that have custom logic and are not needed to allow hack using laptop
    }[];
  };
}
