import { Util } from '@dgx/client';
import { AMOUNT_KEYS, KEYS_BY_TYPE, STANDARD_EXTRA_UPGRADES, UPGRADES } from '../constants.upgrades';
import { OVERRIDE_MODEL_STANDARD_EXTRA_UPGRADES } from '@shared/upgrades/constants.upgrades';

class UpgradesManager extends Util.Singleton<UpgradesManager>() {
  constructor() {
    super();
  }

  public get = <T extends Vehicles.Upgrades.Type>(type: T, vehicle: number) => {
    if (!DoesEntityExist(vehicle)) return;
    SetVehicleModKit(vehicle, 0);
    return this.getByKeys(vehicle, KEYS_BY_TYPE[type], true);
  };

  public getByKeys = <T extends Vehicles.Upgrades.Key[]>(vehicle: number, keys: T, internal = false) => {
    if (internal) {
      if (!DoesEntityExist(vehicle)) return;
      SetVehicleModKit(vehicle, 0);
    }

    const upgrades = {} as Pick<Vehicles.Upgrades.Upgrades, T[number]>;
    for (const key of keys) {
      // @ts-ignore - we know this is fine because both 'upgrades' and return of 'get' are same type when key is same but ts wont recognize
      upgrades[key] = UPGRADES[key].get(vehicle);
    }
    return upgrades;
  };

  public set = (vehicle: number, upgrades: Partial<Vehicles.Upgrades.Upgrades>) => {
    if (!DoesEntityExist(vehicle)) return;
    SetVehicleModKit(vehicle, 0);

    for (const [key, value] of Object.entries(upgrades) as ObjEntries<Vehicles.Upgrades.Upgrades>) {
      this.setByKey(vehicle, key, value, true);
    }
  };

  public setByKey = <T extends Vehicles.Upgrades.Key>(
    vehicle: number,
    key: T,
    value: Vehicles.Upgrades.PartialValue<T>,
    internal = false
  ) => {
    if (!UPGRADES[key]) {
      console.error(`Unknown upgrade key: ${key}`);
      return;
    }
    if (!internal) {
      if (!DoesEntityExist(vehicle)) return;
      SetVehicleModKit(vehicle, 0);
    }
    UPGRADES[key].set(vehicle, value);
  };

  public getAmounts = (vehicle: number) => {
    if (!DoesEntityExist(vehicle)) return;
    SetVehicleModKit(vehicle, 0);
    // we cast because we know AMOUNT_KEYS contains all keys of 'Vehicles.Upgrades.Amount'
    return this.getAmountByKey(vehicle, AMOUNT_KEYS, true) as Vehicles.Upgrades.Amount;
  };

  public getAmountByKey = <T extends Vehicles.Upgrades.AmountKey[]>(
    vehicle: number,
    keys: T,
    internal = false
  ): Pick<Vehicles.Upgrades.Amount, T[number]> | undefined => {
    if (!internal) {
      if (!DoesEntityExist(vehicle)) return;
      SetVehicleModKit(vehicle, 0);
    }

    const amounts = {} as Pick<Vehicles.Upgrades.Amount, T[number]>;
    for (const key of keys) {
      // @ts-ignore - we know this is fine because both 'amounts' and return of 'getAmount' are same type when key is same but ts wont recognize
      amounts[key] = UPGRADES[key].getAmount(vehicle);
    }
    return amounts;
  };

  public doesVehicleHaveDefaultExtras = (vehicle: number): boolean => {
    const modelHash = GetEntityModel(vehicle) >>> 0;
    if (OVERRIDE_MODEL_STANDARD_EXTRA_UPGRADES[modelHash] !== undefined) {
      return OVERRIDE_MODEL_STANDARD_EXTRA_UPGRADES[modelHash];
    }

    const vehicleClass = GetVehicleClass(vehicle);
    return STANDARD_EXTRA_UPGRADES.includes(vehicleClass);
  };
}

const upgradesManager = UpgradesManager.getInstance();
export default upgradesManager;
