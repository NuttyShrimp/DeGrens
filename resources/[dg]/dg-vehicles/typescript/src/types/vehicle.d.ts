declare namespace Vehicle {
  type VehicleType = 'sea' | 'land' | 'air';

  interface VehicleStatus {
    body: number;
    engine: number;
    fuel: number;
    /**
     * Array of length 10,
     * -1 = Completely destroyed,
     * 1 - 1000 = Health,
     */
    wheels: number[];
    /**
     * Array of length 8,
     * True if broken
     */
    windows: boolean[];
    /*
     * Array of length 6,
     * True if broken
     */
    doors: boolean[];
  }

  interface Vehicle<StatusType = VehicleStatus, StanceType = Stance.Data | null> {
    vin: string;
    cid: number;
    model: string;
    plate: string;
    fakeplate: string;
    state: SVGarage.GarageState;
    garageId: string;
    status: StatusType;
    harness: number;
    stance: StanceType;
    wax: number | null;
    nos: number;
  }
}
