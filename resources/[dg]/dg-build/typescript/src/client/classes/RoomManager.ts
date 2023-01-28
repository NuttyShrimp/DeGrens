import { Util } from '@dgx/client';

import { Plans } from '../data/plans';

import { Room } from './Room';

export class RoomManager extends Util.Singleton<RoomManager>() {
  private currentRoom: Room | null;

  constructor() {
    super();
    this.currentRoom = null;
  }
  async createRoom(planName: string, pos: number | Vec3) {
    if (!Plans[planName]) {
      throw new Error(`Plan ${planName} not found`);
    }
    if (!IsScreenFadedOut()) {
      DoScreenFadeOut(250);
      await Util.Delay(250);
    }
    const room = new Room(planName, pos);
    this.currentRoom = room;
    return room.createRoom();
  }
  exitRoom(overridePos?: number[] | Coords) {
    if (!this.currentRoom) return;
    if (overridePos) {
      const pos = Array.isArray(overridePos)
        ? { x: overridePos[0], y: overridePos[1], z: overridePos[2] }
        : overridePos;
      this.currentRoom.exit(pos);
      this.currentRoom = null;
      return;
    }
    this.currentRoom.exit();
    this.currentRoom = null;
  }

  isInBuilding() {
    return this.currentRoom !== null;
  }

  currentBuildingVector(): Vec3 | false {
    if (!this.currentRoom) return false;
    return this.currentRoom.roomOrigin;
  }
}
