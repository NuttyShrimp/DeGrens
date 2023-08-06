import { RPC, UI, Util } from '@dgx/client';
import { Vector3, Vector4 } from '@dgx/shared';
import { mapHousesToZones, updateGarageMap } from './zones';
import { getCurrentHouse } from './instance';
import { cleanupZones, generateZones } from '../controllers/zones';

let houses: Record<string, Properties.ClientProperty> = {};
let houseTypes: Record<string, Config.HouseTypeConfig> = {};
let zonePrices: Record<string, Config.ZonePrice> = {};

export const getHousesInfo = () => houses;

export const getHouseInfo = (name: string) => houses[name];

export const getTypeInfo = (type: string) => houseTypes[type];

export const getAccessibleHouses = () => {
  const accessibleHouses = Object.values(houses).filter(h => h.hasKey);
  return accessibleHouses
    .map(h => {
      const houseType = houseTypes[h.type];
      if (!houseType) return null;
      if (h.owned) {
        return {
          name: h.name,
          locked: h.locked,
          owned: true,
          accessList: h.accessList!,
          flags: {
            garage: houseType.options.garage,
            locations: true,
          },
          metadata: {
            maxKeys: houseType.options.shareable_keys ?? 0,
          },
        };
      }
      return {
        name: h.name,
        locked: h.locked,
        owned: false,
      };
    })
    .filter(h => h);
};

export const getBuyableHouse = async () => {
  const plyCoords = Util.getPlyCoords();
  const house = Object.values(houses).find(h => h.enter.distance(plyCoords) < 2);
  if (!house) return;

  const zoneName = GetNameOfZone(plyCoords.x, plyCoords.y, plyCoords.z);
  const zonePrice = zonePrices[zoneName];
  if (!zonePrice) {
    return;
  }

  let price = zonePrice.basePrice;
  if (zonePrice[house.type]) {
    price += (zonePrice[house.type] / 100) * zonePrice.basePrice;
  }
  const taxInfo = await RPC.execute('financials:server:taxes:calc', price, 3);
  if (!taxInfo) return;

  return {
    name: house.name,
    price: taxInfo.taxPrice ?? price,
    owned: house.accessList !== null && house.accessList !== undefined,
  };
};

export const loadHouses = async () => {
  const houseEntries = (await RPC.execute('realestate:houses:getHouses')) ?? [];
  houseTypes = (await RPC.execute<Record<string, Config.HouseTypeConfig>>('realestate:houses:getPropertyTypes')) ?? {};
  zonePrices = (await RPC.execute<Record<string, Config.ZonePrice>>('realestate:config:getZonePrices')) ?? {};
  for (const house of houseEntries) {
    houses[house.name] = {
      ...house,
      enter: Vector3.create(house.enter),
    };
    if (house.garage) {
      houses[house.name].garage = Vector4.create(house.garage);
    }
  }
  mapHousesToZones();
};

export const hasAccess = (propertyName: string) => {
  const houseInfo = houses[propertyName];
  return houseInfo && houseInfo.hasKey;
};

export const updateHouseGarage = (propertyName: string, coords: Vec4) => {
  const houseInfo = houses[propertyName];
  if (!houseInfo) return;
  let oldLoc: Vector4 | null = null;
  if (houseInfo.garage) {
    oldLoc = houseInfo.garage.clone();
  }
  houseInfo.garage = Vector4.create(coords);
  updateGarageMap(houseInfo, oldLoc);
};

export const updateHouseOwner = (propertyName: string, newOwner: number) => {
  const houseInfo = houses[propertyName];
  if (!houseInfo) return;
  houseInfo.owned = LocalPlayer.state.citizenid === newOwner;
  houseInfo.accessList = [];
  houseInfo.hasKey = houseInfo.owned;
};

export const setHouseLock = (propertyName: string, isLocked: boolean) => {
  const houseInfo = houses[propertyName];
  if (!houseInfo) return;
  houseInfo.locked = isLocked;
  UI.SendAppEvent('phone', {
    appName: 'realestate',
    action: 'changeLockState',
    data: {
      name: propertyName,
      locked: isLocked,
    },
  });
};

export const addKeyToHouse = (name: string, entry: Properties.AccessListEntry) => {
  const info = houses[name];
  if (!info.accessList) {
    info.accessList = [];
  }
  if (LocalPlayer.state.citizenid === entry.cid) {
    info.hasKey = true;
  }
  info.accessList.push(entry);
};

export const removeKeyFromHouse = (name: string, cid: number) => {
  const info = houses[name];
  if (!info.accessList) return;

  const index = info.accessList.findIndex(e => e.cid === cid);
  if (index === -1) return;

  info.accessList.splice(index, 1);
  if (cid === LocalPlayer.state.citizenid) {
    info.hasKey = false;
    info.accessList = [];
  }
};

export const updateHouseLocation = (name: string, type: keyof Properties.PropertyLocations, coords: Vec4) => {
  const info = houses[name];
  info.locations[type] = coords;

  if (!getCurrentHouse()) return;

  cleanupZones();
  generateZones();
};
