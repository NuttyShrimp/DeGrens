declare namespace SVGarage {
  interface Log {
    cid: number;
    action: 'parked' | 'retrieved';
    state: string;
  }
}
