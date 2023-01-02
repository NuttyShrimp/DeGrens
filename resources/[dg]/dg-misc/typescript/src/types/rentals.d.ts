declare namespace Rentals {
  interface Rental {
    model: string;
    price: number;
    locations: string[];
  }

  interface Location {
    id: string;
    coords: Vec4;
    spawns: Vec4[];
  }

  interface Config {
    vehicles: Rental[];
    locations: Location[];
  }
}
