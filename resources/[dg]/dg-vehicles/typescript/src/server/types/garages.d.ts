declare namespace SVGarage {
  interface Log {
    vin: string;
    cid: number;
    logDate: string;
    action: 'parked' | 'retrieved';
    state: string;
  }
}
