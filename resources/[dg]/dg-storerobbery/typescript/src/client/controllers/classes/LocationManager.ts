import { Util } from '@dgx/client';
import { buildRegisterZone, destroyRegisterZone } from 'modules/registers/helpers.registers';
import { buildSafeZone, checkSafeState, destroySafeZone } from 'modules/safes/helpers.safe';

class LocationManager extends Util.Singleton<LocationManager>() {
  private _currentStore: Store.Id;

  get currentStore() {
    return this._currentStore;
  }
  private set currentStore(value: Store.Id) {
    this._currentStore = value;
  }

  enteredStore = (storeId: Store.Id) => {
    this.currentStore = storeId;
    buildRegisterZone(this.currentStore);
    buildSafeZone(this.currentStore);
  };

  leftStore = () => {
    destroyRegisterZone();
    destroySafeZone();
    checkSafeState(this.currentStore);
    this.currentStore = null;
  };
}

const locationManager = LocationManager.getInstance();
export default locationManager;
