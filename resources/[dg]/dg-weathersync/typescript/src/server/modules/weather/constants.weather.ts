export const DEFAULT_DURATION = 20; // minutes

export const WEATHERS: Record<
  WeatherSync.Type,
  {
    enabled: boolean;
    rainLevel?: number;
    windSpeed: number;
    transitions: { type: WeatherSync.Type; percentage: number }[]; // percentages should add up to 100
    cannotBeFirst?: boolean;
    duration?: number;
  }
> = {
  EXTRASUNNY: {
    enabled: true,
    windSpeed: 0.5,
    transitions: [
      { type: 'CLEAR', percentage: 80 },
      { type: 'OVERCAST', percentage: 20 },
    ],
  },
  CLEAR: {
    enabled: true,
    windSpeed: 1,
    transitions: [
      { type: 'FOGGY', percentage: 5 },
      { type: 'CLEAR', percentage: 15 },
      { type: 'CLOUDS', percentage: 15 },
      { type: 'SMOG', percentage: 5 },
      { type: 'EXTRASUNNY', percentage: 60 },
    ],
  },
  CLEARING: {
    enabled: true,
    windSpeed: 4,
    transitions: [
      { type: 'FOGGY', percentage: 5 },
      { type: 'CLOUDS', percentage: 10 },
      { type: 'SMOG', percentage: 5 },
      { type: 'CLEAR', percentage: 30 },
      { type: 'EXTRASUNNY', percentage: 50 },
    ],
    rainLevel: 0,
    cannotBeFirst: true,
    duration: 5,
  },
  OVERCAST: {
    enabled: true,
    windSpeed: 5,
    transitions: [
      { type: 'RAIN', percentage: 4 },
      { type: 'THUNDER', percentage: 1 },
      { type: 'CLOUDS', percentage: 7 },
      { type: 'SMOG', percentage: 7 },
      { type: 'FOGGY', percentage: 10 },
      { type: 'CLEAR', percentage: 30 },
      { type: 'EXTRASUNNY', percentage: 41 },
    ],
  },
  SMOG: {
    enabled: true,
    windSpeed: 2,
    transitions: [{ type: 'CLEAR', percentage: 100 }],
    duration: 10,
  },
  FOGGY: {
    enabled: true,
    windSpeed: 4,
    transitions: [
      { type: 'RAIN', percentage: 10 },
      { type: 'CLEAR', percentage: 90 },
    ],
    duration: 10,
  },
  CLOUDS: {
    enabled: true,
    windSpeed: 5,
    transitions: [
      { type: 'RAIN', percentage: 10 },
      { type: 'CLEARING', percentage: 50 },
      { type: 'OVERCAST', percentage: 40 },
    ],
    duration: 10,
  },
  RAIN: {
    enabled: true,
    rainLevel: 0.25,
    windSpeed: 8,
    transitions: [{ type: 'CLEARING', percentage: 100 }],
    cannotBeFirst: true,
    duration: 3,
  },
  THUNDER: {
    enabled: true,
    rainLevel: 0.25,
    windSpeed: 12,
    transitions: [{ type: 'CLEARING', percentage: 100 }],
    cannotBeFirst: true,
    duration: 3,
  },
  // All snow related only cycle between other snow related types
  SNOW: {
    enabled: false,
    windSpeed: 6,
    transitions: [
      { type: 'XMAS', percentage: 30 },
      { type: 'SNOWLIGHT', percentage: 35 },
      { type: 'BLIZZARD', percentage: 35 },
    ],
  },
  BLIZZARD: {
    enabled: false,
    windSpeed: 12,
    transitions: [
      { type: 'XMAS', percentage: 50 },
      { type: 'SNOWLIGHT', percentage: 50 },
    ],
  },
  SNOWLIGHT: {
    enabled: false,
    windSpeed: 4,
    transitions: [
      { type: 'SNOW', percentage: 50 },
      { type: 'XMAS', percentage: 50 },
    ],
  },
  XMAS: {
    enabled: false,
    windSpeed: 6,
    transitions: [
      { type: 'SNOW', percentage: 35 },
      { type: 'SNOWLIGHT', percentage: 35 },
      { type: 'BLIZZARD', percentage: 30 },
    ],
  },
  // Halloween always stays self
  HALLOWEEN: {
    enabled: false,
    rainLevel: 0.5,
    windSpeed: 12,
    transitions: [{ type: 'HALLOWEEN', percentage: 100 }],
  },
};

export const validateWeatherConfig = () => {
  for (const [type, { transitions }] of Object.entries(WEATHERS)) {
    let percentageTotal = 0;
    transitions.forEach(t => {
      percentageTotal += t.percentage;
    });

    if (percentageTotal !== 100) {
      console.error(`Transition percentages for type ${type} dont add up to 100`);
    }
  }
};
