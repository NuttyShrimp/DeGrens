import { Util, PolyZone, RPC } from '@dgx/client';
import { buildRegisterZone, destroyRegisterZone } from 'modules/registers/service.registers';
import { buildSafeZone, checkSafeState, destroySafeZone } from 'modules/safes/service.safe';

class LocationManager extends Util.Singleton<LocationManager>() {
  private _currentStore: Storerobbery.Id | null = null;

  constructor() {
    super();
    PolyZone.onEnter('store_building', (_: string, data: { id: Storerobbery.Id }) => {
      this.enteredStore(data.id);
    });
    PolyZone.onLeave('store_building', () => {
      this.leftStore();
    });
    RPC.register('storerobbery:client:isInStore', () => {
      return this.currentStore !== null;
    });
  }

  get currentStore() {
    return this._currentStore;
  }
  private set currentStore(value: typeof this._currentStore) {
    this._currentStore = value;
  }

  public buildStoreZones = (storeConfig: Storerobbery.Config['stores']) => {
    for (const [id, store] of Object.entries(storeConfig)) {
      PolyZone.addBoxZone('store_building', store.storezone.center, store.storezone.length, store.storezone.width, {
        ...store.storezone.options,
        data: {
          id,
        },
      });
    }
  };

  private enteredStore = (storeId: Storerobbery.Id) => {
    this.currentStore = storeId;
    buildRegisterZone(this.currentStore);
    buildSafeZone(this.currentStore);
  };

  private leftStore = () => {
    destroyRegisterZone();
    destroySafeZone();
    if (this.currentStore !== null) {
      checkSafeState(this.currentStore);
    }
    this.currentStore = null;
  };
}

const locationManager = LocationManager.getInstance();
export default locationManager;
