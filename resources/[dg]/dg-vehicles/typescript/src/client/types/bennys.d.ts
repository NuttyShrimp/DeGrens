declare namespace Bennys {
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

    // type GenericChange = {
    //   name: Exclude<Vehicles.Upgrades.Key, 'colors', 'wheels', 'extras'>;
    //   data: number;
    // };

    // type ColorChange = {
    //   name: 'colors';
    //   data: Vehicles.Upgrades.Cosmetic;
    // };

    // type WheelChange = {
    //   name: 'wheels';
    //   data: Vehicles.Upgrades.Cosmetic['wheels'];
    // };

    // type ExtraChange = {
    //   name: 'extras';
    //   data: {
    //     id: number;
    //     enabled: boolean;
    //   };
    // };

    type Change<T extends Vehicles.Upgrades.Cosmetic.Key = Vehicles.Upgrades.Cosmetic.Key> = {
      name: T;
      data: Vehicles.Upgrades.Cosmetic.Upgrades[T];
    };

    // type Change = GenericChange | ColorChange | WheelChange | ExtraChange;
  }
}
