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

  type Category = 'colors' | 'interior' | 'exterior' | 'wheels' | 'extras';
  type ColorKey =
    | 'primaryColor'
    | 'secondaryColor'
    | 'pearlescentColor'
    | 'interiorColor'
    | 'dashboardColor'
    | 'wheelColor';

  namespace UI {
    namespace Components {
      type Generic = {
        name: string;
        // Which id is equipped (-1-indexed)
        equipped: number;
        // Name of the component for each id (e.g. "Front Wheel #1")
        componentNames: string[];
      };

      type Color = {
        name: Extract<Vehicles.Upgrades.Key, ColorKey>;
        equipped: RGB | number;
      };
    }

    type WheelsCategories = (Omit<Generic, 'name' | 'equipped'> & { id: number; label: string })[];

    type Change<T extends Vehicles.Upgrades.Cosmetic.Key = Vehicles.Upgrades.Cosmetic.Key> = {
      name: T;
      data: Vehicles.Upgrades.Cosmetic.Upgrades[T];
    };
  }
}
