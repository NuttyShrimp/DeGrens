class DoorLock {
  public changeDoorState = (doorId: string, locked: boolean) => {
    global.exports['dg-doorlock'].changeDoorState(doorId, locked);
  };
}

export default {
  DoorLock: new DoorLock(),
};
