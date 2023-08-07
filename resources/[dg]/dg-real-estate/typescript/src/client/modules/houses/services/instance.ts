import { Events, Interiors, Notifications, PolyZone, Sounds, Sync } from '@dgx/client';
import { getHouseInfo, getTypeInfo } from './store';
import { cleanupZones, generateZones } from '../controllers/zones';
import { Vector3 } from '@dgx/shared';

let currentHouse: string | null = null;
let currentHouseCenter: Vec3 | null = null;

export const getCurrentHouse = () => currentHouse;
export const getCurrentHouseCenter = () => currentHouseCenter;

export const enterProperty = async (name: string) => {
  const houseInfo = getHouseInfo(name);
  if (!houseInfo) return;

  const propertyTypeInfo = getTypeInfo(houseInfo.type);
  if (!propertyTypeInfo) return;

  if (Interiors.isInBuilding()) {
    return;
  }

  Sounds.playLocalSound('houses_door_open', 0.7);
  const success = await Interiors.createRoom(propertyTypeInfo.interior, houseInfo.enter.add(new Vector3(0, 0, -100)));
  if (!success) {
    Notifications.add("Couldn't enter property", 'error');
    Events.emitNet('realestate:leaveProperty');
    return;
  }

  const shellCenter = success[0];

  currentHouse = name;
  currentHouseCenter = shellCenter;

  generateZones();
};

export const leaveProperty = () => {
  if (!Interiors.isInBuilding() || !currentHouse) return;

  cleanupZones();

  Sounds.playLocalSound('houses_door_close', 0.7);
  Interiors.exitRoom();

  currentHouse = null;
  currentHouseCenter = null;
};
