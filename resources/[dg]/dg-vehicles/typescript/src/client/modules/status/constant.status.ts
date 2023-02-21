export const degradationValues: Record<
  keyof Service.Status,
  (Service.Degradation & { step: number; bottom: number })[]
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
        bottom: 0,
      });
    }
  }
};

export const serviceConditions = [
  {
    label: 'Excellent',
    percentage: 95,
  },
  {
    label: 'Good',
    percentage: 80,
  },
  {
    label: 'Bad',
    percentage: 50,
  },
  {
    label: 'Terrible',
    percentage: 0,
  },
];

export const partNames: Record<keyof Service.Status, string> = {
  engine: 'Engine',
  suspension: 'Suspension',
  brakes: 'Brakes',
  axle: 'Axle',
};

export const handlingOverrideFunctions: Record<string, (veh: number, value: number) => void> = {
  fInitialDriveForce: (veh, val) => SetVehicleCheatPowerIncrease(veh, val),
};

export const MINIMUM_DAMAGE_FOR_GUARANTEED_STALL = 150;
export const MINIMUM_DAMAGE_FOR_STALL = 30;
