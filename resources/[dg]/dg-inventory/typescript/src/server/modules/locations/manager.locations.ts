import { Events, Util } from '@dgx/server';
import { RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { Vector3 } from '@dgx/shared';
import inventoryManager from 'modules/inventories/manager.inventories';
import { getConfig } from 'services/config';
import { mainLogger } from 'sv_logger';
import { concatId } from '../../util';
import winston from 'winston';

// This keeps track of all location based inventories.
// When an inv gets opened, it gets added to locations.
// When an item gets moved into the inventory, it gets activated
// Players can open non activated inventories
// But only activated inventories will be client sided visible (ex: drop markers)
@RPCRegister()
class LocationManager extends Util.Singleton<LocationManager>() {
  private readonly logger: winston.Logger;
  private readonly locations: Location.Locations;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'LocationManager' });
    this.locations = { drop: new Map(), dumpster: new Map() };
  }

  @RPCEvent('inventory:server:getDrops')
  private _getDrops = () => [...this.locations.drop.values()].filter(drop => drop.activated).map(drop => drop.pos);

  public getLocation = (type: Location.Type, coords: Vec3, ignoreOthers = false) => {
    if (!ignoreOthers) {
      const newPos = new Vector3(coords.x, coords.y, coords.z);
      const distance = getConfig().locationInvRange[type];
      for (const [id, data] of this.locations[type]) {
        if (newPos.distance(data.pos) < distance) {
          return id;
        }
      }
    }

    const newId = concatId(type, Util.uuidv4());
    this.locations[type].set(newId, { pos: coords, activated: false });
    return newId;
  };

  public removeLocation = (type: Location.Type, id: string) => {
    const location = this.locations[type].get(id);
    if (!location) throw new Error('Tried to remove non-existent location id');

    if (type === 'drop') {
      const drop = location as Location.Drop;
      if (drop.timeout) {
        clearTimeout(drop.timeout);
      }
      if (drop.activated) {
        Events.emitNet('inventory:client:updateDrop', -1, 'remove', drop.pos);
      }
    }

    this.locations[type].delete(id);
    inventoryManager.remove(id);
  };

  public activateDrop = (id: string) => {
    const pos = this.locations.drop.get(id)?.pos;
    if (!pos) throw new Error('Tried to activate non-existent location id');

    Events.emitNet('inventory:client:updateDrop', -1, 'add', pos);
    this.logger.info(`Drop (${id}) has been activated`);

    const dropRemoveTime = getConfig().dropRemoveTime;
    const timeout = setTimeout(
      async id => {
        Util.Log(
          'inventory:dropRemoved',
          {
            id,
          },
          `Drop ${id} got removed because of time.`
        );
        const inventory = await inventoryManager.get(id);
        inventory.destroyAllItems();
        this.removeLocation('drop', id);
        this.logger.info(`Drop (${id}) and its contents have been destroyed`);
      },
      dropRemoveTime * 60 * 1000,
      id
    );
    this.locations.drop.set(id, { pos, activated: true, timeout });
  };

  public isLocationBased = (type: Inventory.Type) => {
    return type === 'drop' || type === 'dumpster';
  };
}

const locationManager = LocationManager.getInstance();
export default locationManager;
