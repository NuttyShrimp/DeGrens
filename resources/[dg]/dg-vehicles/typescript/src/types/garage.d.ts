declare namespace Garage {
  type GarageType = 'land' | 'air' | 'sea';

  interface BoxLocation {
    vector: Vec3;
    width: number;
    length: number;
    options: {
      minZ: number;
      maxZ: number;
      heading: number;
    };
  }

  interface ProxyLocation {
    vector: Vec2[];

    options: {
      minZ: number;
      maxZ: number;
    };
  }

  interface ParkingSpot {
    type: GarageType;
    /**
     * This box where the vehicle should be parked in
     */
    size: number;
    /**
     * this is an extension of the box where the player can be in to access the garage
     */
    distance: number;
    heading: number;
    coords: Vec3;
  }

  interface Garage {
    garage_id: string;
    name: string;
    type: 'public' | 'business' | 'police' | 'ambulance';
    shared: boolean;
    vehicle_types: GarageType[];
    parking_limit?: number;
    location: BoxLocation | ProxyLocation;
    parking_spots: ParkingSpot[];
  }

  interface AppEntry {
    name: string;
    brand: string;
    plate: string;
    vin: string;
    parking: string;
    state: 'parked' | 'out' | 'impounded';
    engine: number;
    body: number;
  }
}
