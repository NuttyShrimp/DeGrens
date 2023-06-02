declare namespace Doorlock {
  type PolyZone = { center: Vec3; width: number; length: number; heading: number };

  type Thermite = {
    grid: number; // Gridsize
    amount: number; // Length of hack
    ped: Vec2 & { heading: number }; // Ped X Y postion and heading (Manually allign to properly fit door)
  };

  type DoorData = {
    model: number;
    coords: Vec3;
    linkedIds: number[];
  } & Pick<DoorConfig, 'authorized' | 'polyzone' | 'thermiteable' | 'name'> &
    Required<
      Pick<
        DoorConfig,
        | 'distance'
        | 'hideInteraction'
        | 'noAnimation'
        | 'playSound'
        | 'lockpickable'
        | 'forceOpen'
        | 'allowThroughWalls'
      >
    >;

  type DoorConfig = {
    description?: string; // not used, just a description for ease of editing JSON
    locked: boolean; // How the doorstate should be on resourcestart
    distance?: number; // Defaults to 2
    authorized: {
      job?: { name: string; rank?: number }[];
      business?: string[]; // Employees need 'property_access'!!
      gang?: string[];
    };
    doors: { model: string; coords: Vec3 }[];
    name?: string; // This name can be used to toggle doors scriptwise
    polyzone?: PolyZone; // Use polyzone to toggle instead of raycast on obj

    // These 3 options all default to false
    playSound?: boolean;
    hideInteraction?: boolean;
    noAnimation?: boolean;
    forceOpen?: boolean;
    allowThroughWalls?: boolean;

    // Makes door lockpickable (Defaults to false)
    lockpickable?: boolean;
    // Makes door thermiteable
    thermiteable?: Thermite;
  };

  type ClientData = Record<number, DoorData & { locked: boolean }>;
}
