export const timePerWeather = 20 * 60; // 20 minutes
export const overrideTime = 30; // 30 seconds type transition weather type

export const WEATHERS: Record<
  WeatherSync.Type,
  {
    enabled: boolean;
    rainLevel?: number;
    windSpeed: number;
    temperatureRange: [number, number];
    transitions: { type: WeatherSync.Type; percentage: number }[]; // percentages should add up type 100!!!
    cannotBeFirst?: boolean;
    minutes?: number;
  }
> = {
  EXTRASUNNY: {
    enabled: true,
    windSpeed: 0.5,
    temperatureRange: [90, 110],
    transitions: [
      { type: 'CLEAR', percentage: 75 },
      { type: 'OVERCAST', percentage: 25 },
    ],
  },
  CLEAR: {
    enabled: true,
    windSpeed: 1,
    temperatureRange: [80, 95],
    transitions: [
      { type: 'FOGGY', percentage: 10 },
      { type: 'CLEAR', percentage: 15 },
      { type: 'CLOUDS', percentage: 15 },
      { type: 'SMOG', percentage: 10 },
      { type: 'EXTRASUNNY', percentage: 50 },
    ],
  },
  CLEARING: {
    enabled: true,
    windSpeed: 4,
    temperatureRange: [75, 85],
    transitions: [
      { type: 'FOGGY', percentage: 5 },
      { type: 'CLOUDS', percentage: 15 },
      { type: 'SMOG', percentage: 10 },
      { type: 'CLEAR', percentage: 30 },
      { type: 'EXTRASUNNY', percentage: 40 },
    ],
  },
  OVERCAST: {
    enabled: true,
    windSpeed: 5,
    temperatureRange: [80, 80],
    transitions: [
      { type: 'RAIN', percentage: 5 },
      { type: 'THUNDER', percentage: 1 },
      { type: 'CLOUDS', percentage: 9 },
      { type: 'SMOG', percentage: 10 },
      { type: 'FOGGY', percentage: 15 },
      { type: 'CLEAR', percentage: 25 },
      { type: 'EXTRASUNNY', percentage: 35 },
    ],
  },
  SMOG: {
    enabled: true,
    windSpeed: 2,
    temperatureRange: [90, 95],
    transitions: [{ type: 'CLEAR', percentage: 100 }],
    minutes: 10,
  },
  FOGGY: {
    enabled: true,
    windSpeed: 4,
    temperatureRange: [80, 90],
    transitions: [
      { type: 'RAIN', percentage: 10 },
      { type: 'CLEAR', percentage: 90 },
    ],
    minutes: 10,
  },
  CLOUDS: {
    enabled: true,
    windSpeed: 5,
    temperatureRange: [80, 90],
    transitions: [
      { type: 'RAIN', percentage: 10 },
      { type: 'CLEARING', percentage: 50 },
      { type: 'OVERCAST', percentage: 40 },
    ],
    minutes: 10,
  },
  RAIN: {
    enabled: true,
    rainLevel: 0.25,
    windSpeed: 8,
    temperatureRange: [75, 90],
    transitions: [{ type: 'CLEARING', percentage: 100 }],
    cannotBeFirst: true,
    minutes: 3,
  },
  THUNDER: {
    enabled: true,
    rainLevel: 0.25,
    windSpeed: 12,
    temperatureRange: [75, 90],
    transitions: [{ type: 'CLEARING', percentage: 100 }],
    cannotBeFirst: true,
    minutes: 3,
  },
  // All snow related only cycle between other snow related types
  SNOW: {
    enabled: false,
    windSpeed: 6,
    temperatureRange: [0, 32],
    transitions: [
      { type: 'XMAS', percentage: 30 },
      { type: 'SNOWLIGHT', percentage: 35 },
      { type: 'BLIZZARD', percentage: 35 },
    ],
  },
  BLIZZARD: {
    enabled: false,
    windSpeed: 12,
    temperatureRange: [-15, 10],
    transitions: [
      { type: 'XMAS', percentage: 50 },
      { type: 'SNOWLIGHT', percentage: 50 },
    ],
  },
  SNOWLIGHT: {
    enabled: false,
    windSpeed: 4,
    temperatureRange: [0, 32],
    transitions: [
      { type: 'SNOW', percentage: 50 },
      { type: 'XMAS', percentage: 50 },
    ],
  },
  XMAS: {
    enabled: false,
    windSpeed: 6,
    temperatureRange: [-5, 15],
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
    temperatureRange: [50, 80],
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
