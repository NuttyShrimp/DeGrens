class DoorLock {
  public registerDoor = (entity: number) => {
    global.exports['dg-doorlock'].registerDoor(entity);
  };

  public toggleEntityDoorState = (entity: number) => {
    global.exports['dg-doorlock'].toggleEntityDoorState(entity);
  };

  public changeDoorState = (doorId: string, locked: boolean) => {
    global.exports['dg-doorlock'].changeDoorState(doorId, locked);
  };
}

export default {
  DoorLock: new DoorLock(),
};
