type Category =
  | 'coupes'
  | 'offroad'
  | 'compacts'
  | 'motorcycles'
  | 'sedans'
  | 'sports'
  | 'sportsclassics'
  | 'super'
  | 'suvs'
  | 'muscle'
  | 'vans'
  | 'cycles'
  | 'service';
type Shop = 'pdm' | 'luxury' | 'nfs' | 'air';
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
  }
}

declare interface modelInfo {
  valid: boolean;
  automobile: boolean;
}

declare namespace Stance {
  type Data = {
    frontLeft: number;
    frontRight: number;
    backLeft: number;
    backRight: number;
  };

  type Model = {
    model: string;
    component: string;
    value: number;
    stance: Data;
  };
}
