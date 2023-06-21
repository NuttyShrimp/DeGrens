export const degradationValues: Record<keyof Service.Status, (Service.Degradation & { step: number })[]> = {
  engine: [],
  axle: [],
  brakes: [],
  suspension: [],
};

export const setDegradationValues = (config: Service.DegradationConfig) => {
  for (const part of Object.keys(config) as (keyof Service.Status)[]) {
    for (const value of config[part]) {
      degradationValues[part].push({
        ...value,
        step: (1 - value.percent) / 1000,
      });
    }
  }
};

export const MINIMUM_DAMAGE_FOR_GUARANTEED_STALL = 65;
export const MINIMUM_DAMAGE_FOR_STALL = 20;
