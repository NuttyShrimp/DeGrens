import { Core, Events, SQL, Util, Vehicles } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import { getREConfig } from 'services/config';
import { mainLogger } from 'sv_logger';

class PropertyManager {
  private properties: Properties.ServerProperty[] = [];
  private types: Config.HousesConfig['types'] = {};
  private propertyState: Record<string, Properties.PropertyState> = {};

  private async savePropertyToDB(name: string) {
    const property = this.getHouseForName(name);
    if (!property) return;
    let result = await SQL.query(
      `
                                   INSERT INTO realestate_locations (name, garage, stash, logout, clothing)
                                   VALUES (?,?,?,?,?)
                                   ON DUPLICATE KEY UPDATE garage = VALUES(garage), stash = VALUES(stash), logout = VALUES(logout), clothing = VALUES(clothing)
                                   RETURNING id
    `,
      [
        property.name,
        property.garage ? JSON.stringify(property.garage) : null,
        property.locations.stash ? JSON.stringify(property.locations.stash) : null,
        property.locations.logout ? JSON.stringify(property.locations.logout) : null,
        property.locations.clothing ? JSON.stringify(property.locations.clothing) : null,
      ]
    );

    const propertyId = result?.[0]?.id;
    if (!propertyId) {
      mainLogger.error(`Failed to update property ${name}`, property);
      return;
    }
    property.id = propertyId;
    // Delete CIDs who don't have access anymore
    await SQL.query(
      'DELETE FROM realestate_location_access WHERE cid NOT IN (?) AND location_id = ? AND owner = false',
      [property.access.join(','), property.id]
    );
    // Get the stored owner, if any still exist
    const dbOwner = await SQL.query(
      'SELECT cid FROM realestate_location_access WHERE location_id = ? AND owner = true',
      [property.id]
    );
    // No owner set or owner is changed
    if (!dbOwner?.[0]?.cid || dbOwner[0].cid !== property.owner) {
      await SQL.query('INSERT INTO realestate_location_access (location_id, cid, owner) VALUES (?, ?, true)', [
        property.id,
        property.owner,
      ]);
      if (dbOwner?.[0]?.cid !== property.owner && dbOwner?.[0]?.cid) {
        // We know the current owner has changed so we delete the old one, if he still has access it will be re-added at
        // the end
        await SQL.query('DELETE FROM realestate_location_access WHERE location_id = ? AND cid = ?', [
          property.id,
          dbOwner[0].cid,
        ]);
      }
    }
    await SQL.insertValues(
      'realestate_location_access',
      property.access.map(cid => ({
        location_id: property.id,
        cid,
      })),
      undefined,
      true
    );
  }

  private registerGarage(houseName: string) {
    const property = this.getHouseForName(houseName);
    if (!property?.garage) return;
    Vehicles.registerGarage({
      name: property.name,
      garage_id: `realestate_${property.name.replace(/ /g, '_')}`,
      shared: true,
      vehicle_types: ['land'],
      type: 'house',
      location: {
        length: 4,
        width: 4,
        vector: property.garage,
        options: {
          minZ: property.garage.z - 1.5,
          maxZ: property.garage.z + 5,
          heading: property.garage.w,
        },
      },
      parking_spots: [
        {
          coords: property.garage,
          distance: 1.8,
          size: 2,
          heading: property.garage.w,
          type: 'land',
        },
      ],
    });
  }

  async loadHouses() {
    const config = await getREConfig();
    this.types = config.properties.types;

    const storedPropertyInfo = await SQL.query<
      { id: number; name: string; garage?: string; stash?: string; logout?: string; clothing?: string }[]
    >(`
      SELECT *
      FROM realestate_locations as rl
    `);
    const storedPropertyAccess = await SQL.query<{ location_id: number; cid: number; owner: boolean }[]>(
      'SELECT * FROM realestate_location_access'
    );

    config.locations.forEach(location => {
      const storedInfo = storedPropertyInfo.find(house => house.name === location.name);

      try {
        this.properties.push({
          name: location.name,
          enter: location.coords,
          garage: storedInfo?.garage ? JSON.parse(storedInfo.garage) : undefined,
          locations: {
            clothing: storedInfo?.clothing ? JSON.parse(storedInfo.clothing) : undefined,
            logout: storedInfo?.logout ? JSON.parse(storedInfo.logout) : undefined,
            stash: storedInfo?.stash ? JSON.parse(storedInfo.stash) : undefined,
          },
          type: location.type,
          access: storedInfo
            ? storedPropertyAccess
                .filter(({ location_id, owner }) => !owner && location_id === storedInfo?.id)
                .map(({ cid }) => cid)
            : [],
          owner: storedInfo
            ? storedPropertyAccess.find(({ location_id, owner }) => location_id === storedInfo.id && owner)?.cid
            : undefined,
          id: storedInfo?.id,
        });
        this.propertyState[location.name] = {
          locked: true,
        };
        this.registerGarage(location.name);
      } catch (e) {
        console.error(e);
        mainLogger.error(`Failed to load property ${location.name}`);
      }
    });
  }

  getTypes = () => this.types;

  getHouses = (src: number): Properties.ClientProperty[] => {
    const cid = Util.getCID(src);
    return this.properties.map(p => {
      const propState = this.propertyState[p.name];
      return {
        name: p.name,
        hasKey: p.owner === cid || p.access.includes(cid),
        owned: p.owner === cid,
        locations: p.locations,
        enter: p.enter,
        garage: p.garage,
        type: p.type,
        locked: propState?.locked ?? true,
        accessList: p.owner
          ? p.access
              .map(cid => {
                const ply = Core.getPlayer(cid);
                return ply
                  ? {
                      cid,
                      name: `${ply.charinfo.firstname} ${ply.charinfo.lastname}`,
                    }
                  : null;
              })
              .filter(e => e)
              // Fuck types
              .map(e => e!)
          : undefined,
      };
    });
  };

  getHouseForName = (name: string) => {
    return this.properties.find(p => p.name === name);
  };

  getHousePrice = async (name: string, zone: string) => {
    const houseInfo = this.getHouseForName(name);
    if (!houseInfo) return;
    const zoneConfig = (await getREConfig()).zones;
    const zonePrice = zoneConfig[zone];
    let price = zonePrice.basePrice;
    if (zonePrice[houseInfo.type]) {
      price += (zonePrice[houseInfo.type] / 100) * zonePrice.basePrice;
    }
    return price;
  };

  isLocked = (name: string) => {
    const propertyState = this.propertyState[name];
    return !propertyState || propertyState.locked;
  };

  addProperty = (name: string, type: string, enter: Vec3) => {
    if (this.properties.some(p => Vector3.create(enter).distance(p.enter) < 10)) {
      throw new Error('Property is too close to another property');
    }
    this.properties.push({
      name,
      type,
      enter: enter,
      locations: {},
      access: [],
    });
  };

  hasCidHouseAccess(cid: number, name: string) {
    const plyId = Core.getModule('characters').getServerIdFromCitizenId(cid);
    if (!plyId) return false;
    const result = this.hasHouseAccess(plyId, name);
    console.log(result);
    return result;
  }

  hasHouseAccess = (plyId: number, name: string): boolean => {
    const property = this.getHouseForName(name);
    if (!property) return false;

    const cid = Util.getCID(plyId);
    if (!cid) return false;

    return property.owner === cid || property.access.includes(cid);
  };

  // Returns the new state, defaults to true when state was not found or could not be changed
  togglePropertyLock = (plyId: number, name: string) => {
    const property = this.getHouseForName(name);
    if (!property) return true;

    const propertyState = this.propertyState[name];
    if (!propertyState) return true;

    if (!this.hasHouseAccess(plyId, name)) return propertyState.locked;

    propertyState.locked = !propertyState.locked;
    Util.Log(
      'realestate:toggleLock',
      {
        property: name,
        newState: propertyState.locked,
      },
      `${Util.getName(plyId)} has ${propertyState.locked ? 'locked' : 'unlocked'} a property ${name}`
    );
    Events.emitNet('realestate:setPropertyLock', -1, property.name, propertyState.locked);
    return propertyState.locked;
  };

  removePropertyAccess = (name: string, cidToRemove: number) => {
    const property = this.getHouseForName(name);
    if (!property || !property.owner) return false;

    const accIdx = property.access.findIndex(p => p === cidToRemove);
    if (accIdx === -1) {
      return false;
    }

    property.access.splice(accIdx);
    this.savePropertyToDB(name);

    const charModule = Core.getModule('characters');
    const targetPlySrvId = charModule.getServerIdFromCitizenId(cidToRemove);
    if (targetPlySrvId) {
      Events.emitNet('realestate:property:removeAccess', targetPlySrvId, property.name, cidToRemove);
    }

    property.access.concat([property.owner]).forEach(cid => {
      const targetPlyId = charModule.getServerIdFromCitizenId(cid);
      if (!targetPlyId) return;
      Events.emitNet('realestate:property:removeAccess', targetPlyId, property.name, cidToRemove);
    });

    Util.Log(
      `realestate:removeAccess`,
      { property: name, cidToRemove },
      `Removed access to ${name} for ${cidToRemove}`
    );

    return true;
  };

  async addKey(src: number, name: string, target: number) {
    const property = this.getHouseForName(name);
    if (!property) return false;
    const config = this.types[property.type];
    if (!config) return false;
    if (!config.options.shareable_keys || property.access.length >= config.options.shareable_keys)
      return "You've reached the maximum amount of shareable keys";
    const cid = Util.getCID(src);
    if (property.owner !== cid) return false;
    if (property.access.includes(target) || property.owner === target) {
      return 'This person already has access';
    }

    property.access.push(target);
    this.savePropertyToDB(name);

    const charModule = Core.getModule('characters');
    const targetPly = await charModule.getOfflinePlayer(target);
    if (!targetPly) {
      this.removePropertyAccess(name, target);
      return;
    }

    Util.Log(
      'realestate:addKey',
      { property: name, target, accessList: property.access },
      `${Util.getName(src)} has given ${Util.getName(target)} a key to ${property.name}`,
      src
    );
    property.access.concat([property.owner]).forEach(cid => {
      const targetPlyId = charModule.getServerIdFromCitizenId(cid);
      if (!targetPlyId) return;
      Events.emitNet('realestate:property:giveAccess', targetPlyId, name, {
        cid: target,
        name: `${targetPly.charinfo.firstname} ${targetPly.charinfo.lastname}`,
      });
    });

    return true;
  }

  updateLocation(src: number, name: string, locationType: keyof Properties.PropertyLocations, coords: Vec4) {
    const property = this.getHouseForName(name);
    if (!property) return false;

    const cid = Util.getCID(src);
    if (property.owner !== cid) return false;

    property.locations[locationType] = coords;
    this.savePropertyToDB(name);

    Events.emitNet('realestate:property:updateLocation', -1, name, locationType, coords);
    return true;
  }

  updateGarageLocation(name: string, coords: Vec4) {
    const property = this.getHouseForName(name);
    if (!property) return false;

    property.garage = coords;
    this.savePropertyToDB(name);

    Events.emitNet('realestate:property:setGarage', -1, name, coords);
    Vehicles.unregisterGarage(`realestate_${name.replace(/ /g, '_')}`);
    // Peeps with shit internet
    setTimeout(() => {
      this.registerGarage(name);
    }, 150);
    return true;
  }

  transferOwnership(name: string, newOwnerCid: number) {
    const property = this.getHouseForName(name);
    if (!property) return false;

    const charModule = Core.getModule('characters');
    property.access.forEach(cid => {
      const targetPly = charModule.getServerIdFromCitizenId(cid);
      if (targetPly) {
        Events.emitNet('realestate:property:removeAccess', targetPly, property.name, cid);
      }
    });

    const oldOwner = property.owner;
    property.owner = newOwnerCid;
    property.access = [];
    this.savePropertyToDB(property.name);
    Util.Log(
      `realestate:transferOwnership`,
      {
        oldOwner,
        newOwner: property.owner,
        property: name,
      },
      `${oldOwner} has transferred ${name} to ${property.owner}`
    );

    Events.emitNet('realestate:property:transferOwnership', -1, name, newOwnerCid);
    return true;
  }

  removeGarages() {
    this.properties.forEach(p => {
      if (!p.garage) return;
      Vehicles.unregisterGarage(`realestate_${p.name.replace(/ /g, '_')}`);
    });
  }
}

export const propertyManager = new PropertyManager();
