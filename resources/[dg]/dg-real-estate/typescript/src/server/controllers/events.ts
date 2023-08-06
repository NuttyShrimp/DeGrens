import { BaseEvents, Chat, Events, Financials, Notifications, RPC, TaxIds, Util, Vehicles } from '@dgx/server';
import { instanceManager } from 'classes/instanceManager';
import { propertyManager } from 'classes/propertyManager';
import { appendFile } from 'fs/promises';
import { enterProperty } from 'services/actions';
import { getREConfig } from 'services/config';

global.exports('playerHasAccess', (cid: number, garageId: string) => {
  return propertyManager.hasCidHouseAccess(cid, garageId.replace('realestate_', '').replace(/_/g, ' '));
});
global.exports('getHousesForPly', (src: number) => {
  return propertyManager.getHouses(src).filter(h => h.hasKey);
});
global.exports('enterProperty', enterProperty);

Events.onNet('realestate:enterProperty', (src, propertyName: string) => {
  enterProperty(src, propertyName);
});

Events.onNet('realestate:leaveProperty', src => {
  if (!instanceManager.inBuilding(src)) return;
  instanceManager.leave(src);
});

RPC.register('realestate:houses:getHouses', src => propertyManager.getHouses(src));
RPC.register('realestate:houses:getPropertyTypes', () => propertyManager.getTypes());
RPC.register('realestate:config:getZonePrices', async src => {
  return (await getREConfig())?.zones ?? {};
});

RPC.register('realestate:property:toggleLock', (src, name: string) => propertyManager.togglePropertyLock(src, name));

RPC.register('realestate:property:removeKey', (src, name: string, cidToRemove: number) => {
  if (!name || !cidToRemove) return false;
  const propertyInfo = propertyManager.getHouseForName(name);
  if (!propertyInfo) return;
  const cid = Util.getCID(src);
  if (propertyInfo.owner !== cid && cidToRemove !== cid) return false;
  const success = propertyManager.removePropertyAccess(name, cidToRemove);
  // TODO: Log
  return success;
});

RPC.register('realestate:property:transferOwnership', (src, name: string, newOwner: number) => {
  if (!name || !newOwner) return false;
  const cid = Util.getCID(src);
  const property = propertyManager.getHouseForName(name);
  if (!property || property.owner !== cid) return false;
  return propertyManager.transferOwnership(name, newOwner);
});

RPC.register('realestate:property:addKey', (src, name: string, extraKey: number) => {
  if (!name || !extraKey) return;
  return propertyManager.addKey(src, name, extraKey);
});

RPC.register(
  'realestate:property:setLocation',
  (src, name: string, location: keyof Properties.PropertyLocations, coords: Vec4) => {
    if (!name || !location || !coords) return false;
    return propertyManager.updateLocation(src, name, location, coords);
  }
);

RPC.register('realestate:property:tryBuy', async (src, name: string, zone: string) => {
  if (!name) return;
  const houseInfo = propertyManager.getHouseForName(name);
  if (!houseInfo) return false;

  const price = await propertyManager.getHousePrice(name, zone);
  if (!price) return;

  const cid = Util.getCID(src);
  const accId = Financials.getDefaultAccountId(cid);
  if (!accId) return false;

  let success = await Financials.purchase(accId, cid, price, `Aankoop ${name}`, TaxIds.RealEstate);
  if (!success) return 'Aankoop transactie gefaald';

  success = propertyManager.transferOwnership(name, cid);
  return success;
});

Chat.registerCommand(
  'createProperty',
  'create a new property',
  [{ name: 'type', description: 'Property type' }],
  'developer',
  async (src, _, args) => {
    const houseType = args[0];
    if (!houseType) {
      console.log('No house type provided');
      return;
    }

    if (!propertyManager.getTypes()[houseType]) {
      console.log(`Invalid house type, options: ${Object.keys(propertyManager.getTypes()).join(', ')}}`);
      return;
    }

    const clInfo = await RPC.execute<{ streetName: string }>('realestate:property:create', src);
    if (!clInfo) {
      console.log('Failed to get client info');
      return;
    }

    let name = `${clInfo.streetName} 1`;
    let i = 1;
    while (propertyManager.getHouseForName(name)) {
      i++;
      name = `${clInfo.streetName} ${i}`;
    }

    const plyCoords = Util.getPlyCoords(src);
    propertyManager.addProperty(name, houseType, plyCoords);
    await appendFile(
      'newProperties.json',
      `
    {
      "name": "${name}",
      "type": "${houseType}",
      "coords": {
        "x": ${plyCoords.x},
        "y": ${plyCoords.y},
        "z": ${plyCoords.z},
      },
    },`,
      'utf8'
    );
  }
);

RPC.register('realestate:property:setGarage', (src, name: string, coords: Vec4) => {
  return propertyManager.updateGarageLocation(name, coords);
});

BaseEvents.onResourceStop(() => {
  // TODO: unregister all garages
  Util.getAllPlayers().forEach(srvId => {
    if (!instanceManager.inBuilding(srvId)) return;
    instanceManager.leave(srvId);
  });
  propertyManager.removeGarages();
});
