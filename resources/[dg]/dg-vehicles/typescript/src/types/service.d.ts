declare namespace Service {
  type Part = 'axle' | 'brakes' | 'engine' | 'suspension';

  type Status = Record<Part, number>;

  interface Degradation {
    name: string;
    percent: number;
  }

  type DegradationConfig = Record<keyof Status, Degradation[]>;

  interface Config {
    degradationValues: DegradationConfig;
    repairPercentagePerPart: number;
  }
}
