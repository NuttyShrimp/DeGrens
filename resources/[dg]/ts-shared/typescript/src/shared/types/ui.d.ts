declare namespace TaskBar {
  interface Animation {
    animDict?: string;
    anim?: string;
    flags?: number;
    task?: number;
  }

  interface TaskBarSettings {
    canCancel?: boolean;
    cancelOnDeath?: boolean;
    cancelOnMove?: boolean;
    disarm?: boolean;
    disableInventory?: boolean;
    controlDisables?: {
      movement?: boolean;
      carMovement?: boolean;
      mouse?: boolean;
      combat?: boolean;
    };
    animation?: Animation;
    prop?: {
      model?: string;
      bone?: string;
      coords?: Vec3;
      rotation?: Vec3;
    };
  }
}