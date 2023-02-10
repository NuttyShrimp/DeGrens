declare namespace Sync {
  interface ScopePlayer {
    source: number;
    steamId: string;
  }

  type Natives = {
    SetVehicleFuelLevel: [level: number];
    NetworkExplodeVehicle: [isAudible: boolean, isInvisible: boolean, p3: boolean];
    SetEntityVisible: [toggle: boolean, unk: boolean];
    setVehicleOnGround: [];
    setVehicleDoorOpen: [doorId: number, open: boolean];
    SetEntityHealth: [health: number];
  };
}
