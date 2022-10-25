declare namespace SVGarage {
  type GarageState = 'out' | 'parked' | 'impounded';

  interface Log {
    vin: string;
    cid: number;
    logDate: string;
    action: 'parked' | 'retrieved';
    state: string;
  }
}
