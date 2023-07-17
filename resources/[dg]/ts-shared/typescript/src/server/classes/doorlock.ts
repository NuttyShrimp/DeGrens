class DoorLock {
  public changeDoorState = (doorName: string, locked: boolean) => {
    global.exports['dg-doorlock'].changeDoorState(doorName, locked);
  };

  public getDoorCoordsByName = (doorName: string): Vec3 => {
    return global.exports['dg-doorlock'].getDoorCoordsByName(doorName);
  };
}

export default {
  DoorLock: new DoorLock(),
};
