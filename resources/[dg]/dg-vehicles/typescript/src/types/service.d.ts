declare namespace Service {
  interface Status {
    axle: number;
    brakes: number;
    engine: number;
    suspension: number;
  }

  interface Degradation {
    name: string;
    percent: number;
  }

  type DegradationConfig = Record<keyof Status, Degradation[]>;

  interface Config {
    degradationValues: DegradationConfig;
  }
}
