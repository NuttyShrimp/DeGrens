import { RoomManager } from '../classes/RoomManager';

const manager = RoomManager.getInstance();

global.exports('createRoom', (planName: string, pos: number | Vec3) => manager.createRoom(planName, pos));
global.exports('exitRoom', (overridePos?: number[] | Vec3) => manager.exitRoom(overridePos));
global.exports('currentBuildingVector', () => manager.currentBuildingVector());
global.exports('isInBuilding', () => manager.isInBuilding());
