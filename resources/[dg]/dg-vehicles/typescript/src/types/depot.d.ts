declare namespace Depot {
  interface Reason {
    title: string;
    description: string;
    strike: number;
    // in hours
    // between -1 and 2 << 32 where -1 is infinite
    time: number;
    price: number;
    // Gives a normal burger the ability to impound a vehicle for this reason
    allowBurger?: boolean;
  }

  interface Location {
    coords: Vec4;
    width: number;
    length: number;
  }

  interface Locations {
    impound: Location;
    retrieveSpot: Vec4;
  }

  interface Config {
    locations: Locations;
    reasons: Reason[];
    strikes: {
      minimum: number;
      permImpound: number;
      hoursPerStrike: number;
      strikeFallOff: number;
    };
    price: {
      earlyReleaseBase: number;
      multipliers: Record<CarClass, number>;
    };
  }

  interface ImpoundedCar {
    vin: string;
    price: number;
    created_at: number;
    until: number;
  }
}
