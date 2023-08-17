declare namespace Garage {
  type GarageState = 'out' | 'parked' | 'impounded';

  interface AppEntry {
    name: string;
    brand: string;
    plate: string;
    vin: string;
    parking: string;
    state: 'parked' | 'out' | 'impounded';
    engine: number;
    body: number;
    vinscratched: boolean;
  }

  declare type ParkLog = {
    cid: number;
    action: 'parked' | 'retrieved';
    state: string;
  };
}
