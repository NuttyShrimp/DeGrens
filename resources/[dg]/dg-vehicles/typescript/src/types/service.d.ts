declare namespace Service {
  type Part = 'axle' | 'brakes' | 'engine' | 'suspension';

  type Status = Record<Part, number>;

  interface Degradation {
    name: Vehicles.Handlings.HandlingEntry;
    percent: number;
  }

  type DegradationConfig = Record<keyof Status, Degradation[]>;

  interface Config {
    degradationValues: DegradationConfig;
    repairPercentagePerPart: number;
  }
}
