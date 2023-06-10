export const degradationValues: Record<
  keyof Service.Status,
  (Service.Degradation & { step: number })[]
> = {
  engine: [],
  axle: [],
  brakes: [],
  suspension: [],
};

export const setDegradationValues = (config: Service.DegradationConfig) => {
  for (const part of Object.keys(config)) {
    for (const value of config[part as keyof Service.Status]) {
      degradationValues[part as keyof Service.Status].push({
        ...value,
        step: 0,
      });
    }
  }
};

export const handlingOverrideFunctions: Record<string, (veh: number, value: number) => void> = {
  fInitialDriveForce: (veh, val) => SetVehicleCheatPowerIncrease(veh, val),
};

export const MINIMUM_DAMAGE_FOR_GUARANTEED_STALL = 65;
export const MINIMUM_DAMAGE_FOR_STALL = 20;
