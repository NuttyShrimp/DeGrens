import { Util } from '@dgx/client';
import { getHouseInfo, getHousesInfo, hasAccess } from './store';

const zoneToHouse: Record<string, string[]> = {};
const zoneToGarage: Record<string, string[]> = {};

export const mapHousesToZones = () => {
  Object.values(getHousesInfo()).map(h => {
    const zoneName = GetNameOfZone(h.enter.x, h.enter.y, h.enter.z);
    if (!zoneToHouse[zoneName]) {
      zoneToHouse[zoneName] = [];
    }
    zoneToHouse[zoneName].push(h.name);
    if (h.garage) {
      const zoneName = GetNameOfZone(h.garage.x, h.garage.y, h.garage.z);
      if (!zoneToGarage[zoneName]) {
        zoneToGarage[zoneName] = [];
      }
      zoneToGarage[zoneName].push(h.name);
    }
  });
};

export const updateGarageMap = (info: Properties.ClientProperty, oldLoc: Vec4 | null) => {
  if (oldLoc) {
    const zoneName = GetNameOfZone(oldLoc.x, oldLoc.y, oldLoc.z);
    const idx = zoneToGarage[zoneName].indexOf(info.name);
    if (idx > -1) {
      zoneToGarage[zoneName].splice(idx, 1);
    }
  }
  if (info.garage) {
    const zoneName = GetNameOfZone(info.garage.x, info.garage.y, info.garage.z);
    if (!zoneToGarage[zoneName]) {
      zoneToGarage[zoneName] = [];
    }
    zoneToGarage[zoneName].push(info.name);
  }
};

const nearOutsideLocation = (key: 'enter' | 'garage') => {
  const plyCoords = Util.getPlyCoords();
  const zoneName = GetNameOfZone(plyCoords.x, plyCoords.y, plyCoords.z);

  let map = key === 'enter' ? zoneToHouse : zoneToGarage;
  if (!map[zoneName]) return false;
  for (const houseName of map[zoneName]) {
    const houseInfo = getHouseInfo(houseName);
    if (!houseInfo) continue;
    if (!houseInfo[key] || houseInfo[key].distance(plyCoords) > 2) {
      continue;
    }
    return houseInfo.name;
  }
  return null;
};

// TODO: cache info for 5sec to prevent unnecessary looping
export const atPropertyDoor = () => {
  return nearOutsideLocation('enter');
};

export const atPropertyGarage = () => {
  const garage = nearOutsideLocation('garage');
  if (!garage) {
    return false;
  }
  return hasAccess(garage) ? garage : false;
};

export const getZoneForProperty = (name: string) => {
  return Object.keys(zoneToHouse).find(zone => zoneToHouse[zone].includes(name));
};
