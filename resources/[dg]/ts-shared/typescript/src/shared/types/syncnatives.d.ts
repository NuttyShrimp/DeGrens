declare type SyncNatives = {
  SetVehicleFuelLevel: [level: number];
  NetworkExplodeVehicle: [isAudible: boolean, isInvisible: boolean, p3: boolean];
  SetEntityVisible: [toggle: boolean, unk: boolean];
  setVehicleOnGround: [];
  setVehicleDoorOpen: [doorId: number, open: boolean];
};
