type Category =
  | 'compacts'
  | 'sedans'
  | 'suvs'
  | 'coupes'
  | 'muscle'
  | 'sportsclassics'
  | 'sports'
  | 'super'
  | 'motorcycles'
  | 'offroad'
  | 'industrial'
  | 'utility'
  | 'vans'
  | 'cycles'
  | 'boats'
  | 'helicopters'
  | 'planes'
  | 'service'
  | 'emergency'
  | 'military'
  | 'commercial'
  | 'trains'
  | 'openwheel';

type Shop = 'pdm' | 'nfs';
type CarClass = 'X' | 'S' | 'A+' | 'A' | 'B' | 'C' | 'D';

declare namespace Config {
  interface Car {
    name: string;
    brand: string;
    model: string;
    category: Category;
    class: CarClass;
    type: Vehicle.VehicleType;
  }
  type CarSchema = Car & {
    hash: number;
    price: number;
    defaultStock: number;
    /**
     * Given in days
     */
    restockTime: number;
    shop: Shop;
  };
}

declare namespace Bennys {
  interface RepairInfo {
    price: number;
    body: number;
    engine: number;
  }

  interface Location {
    vector: Vec3;
    name: string;
    width: number;
    length: number;
    heading: number;
    vehicleType: Vehicle.VehicleType;
    data: {
      minZ: number;
      maxZ: number;
    };
    hideBlip?: boolean;
  }

  interface SpotData {
    player: number;
    vin: string;
    entity: number;
    upgrades: Vehicles.Upgrades.Cosmetic;
    repair: Bennys.RepairInfo;
    originalStance: Stances.Stance;
  }
}
