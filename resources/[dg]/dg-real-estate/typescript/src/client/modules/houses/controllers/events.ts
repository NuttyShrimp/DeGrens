import { Core, Events, Notifications, RPC, Util } from '@dgx/client';
import { enterProperty, leaveProperty } from '../services/instance';
import {
  addKeyToHouse,
  hasAccess,
  loadHouses,
  removeKeyFromHouse,
  setHouseLock,
  setMailBox,
  updateHouseGarage,
  updateHouseLocation,
  updateHouseOwner,
} from '../services/store';
import { atPropertyDoor, atPropertyGarage } from '../services/zones';

on('realestate:leaveProperty', () => {
  Events.emitNet('realestate:leaveProperty');
});

Events.on('realestate:tryEnterProperty', () => {
  const propertyName = atPropertyDoor();
  if (!propertyName) {
    Notifications.add('Je bent niet bij een voordeur', 'error');
    return;
  }
  if (!hasAccess(propertyName)) {
    Notifications.add('Dit huis is op slot', 'error');
    return;
  }
  Events.emitNet('realestate:enterProperty', propertyName);
});

Events.onNet('realestate:reloadInfo', () => {
  if (!LocalPlayer.state.isLoggedIn) return;
  loadHouses();
});

Events.onNet('realestate:enterProperty', (name: string) => {
  enterProperty(name);
});

Events.onNet('realestate:leaveProperty', () => {
  leaveProperty();
});

Events.onNet('realestate:setPropertyLock', (name: string, isLocked: boolean) => {
  setHouseLock(name, isLocked);
});

Events.onNet('realestate:property:giveAccess', (houseName: string, info: Properties.AccessListEntry) => {
  addKeyToHouse(houseName, info);
});

Events.onNet(
  'realestate:property:updateLocation',
  (name: string, locationType: keyof Properties.PropertyLocations, coords: Vec4) => {
    updateHouseLocation(name, locationType, coords);
  }
);

Events.onNet('realestate:property:transferOwnership', (name: string, newOwner: number) => {
  updateHouseOwner(name, newOwner);
});

Events.onNet('realestate:property:removeAccess', (name: string, cid: number) => {
  removeKeyFromHouse(name, cid);
});

Events.onNet('realestate:property:setGarage', (name: string, coords: Vec4) => {
  updateHouseGarage(name, coords);
});

Events.onNet('realestate:property:setMailBox', (name: string, hasMailbox: boolean) => {
  setMailBox(name, hasMailbox);
});

RPC.register('realestate:property:create', () => {
  const plyCoords = Util.getPlyCoords();
  const [streetHash] = GetStreetNameAtCoord(plyCoords.x, plyCoords.y, plyCoords.z);
  const streetName = GetStreetNameFromHashKey(streetHash);
  return {
    streetName,
  };
});

Core.onPlayerLoaded(() => {
  // Reload houses with proper info if char has access
  loadHouses();
});
