declare namespace Config {
  type Config = {
    properties: HousesConfig;
    locations: Location[];
    zones: Record<string, ZonePrice>;
  };

  type Location = {
    name: string;
    type: string;
    coords: Vec4;
  };

  type HousesConfig = {
    types: Record<string, HouseTypeConfig>;
  };

  type HouseTypeConfig = {
    interior: string;
    label: string;
    options: Partial<{
      garage: boolean;
      furniture: boolean;
      shareable_keys: number;
      stashSize: number;
    }>;
  };

  type ZonePrice = {
    basePrice: number;
    // Percentage of base price that is added or reduced if it matches a property type
    [k: string]: number;
  };
}
