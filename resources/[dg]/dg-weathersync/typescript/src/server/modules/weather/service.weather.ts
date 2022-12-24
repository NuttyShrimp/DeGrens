import { Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import { WEATHERS } from './constants.weather';

const weatherLogger = mainLogger.child({ module: 'WeatherLogger' });

let currentWeather: WeatherSync.Weather | null = null;
let skipNextTransition = false;

export const getCurrentWeather = () => currentWeather;
export const setCurrentWeather = (weather: WeatherSync.Weather, skipTransition = false) => {
  currentWeather = weather;
  GlobalState.weather = { ...weather, skipTransition } satisfies WeatherSync.WeatherStateBag;

  weatherLogger.silly(
    `${weather.type} | ${weather.temperature}F | ${(weather.windSpeed * 3.6).toFixed(2)}kph wind | ${
      (weather.rainLevel ?? 0) * 100
    }% rain`
  );
};

export const startWeatherThread = () => {
  const startType = getRandomEnabledType();
  const startWeather = generateWeatherData(startType);
  setCurrentWeather(startWeather, true);

  setInterval(() => {
    if (skipNextTransition) {
      skipNextTransition = false;
      return;
    }

    const nextType = chooseTransitionForType(currentWeather!.type);
    const nextWeather = generateWeatherData(nextType);
    setCurrentWeather(nextWeather);
  }, 20 * 60 * 1000);
};

export const generateWeatherData = (type: WeatherSync.Type) => {
  const nextData = WEATHERS[type];
  return {
    type: type,
    windSpeed: Math.round(nextData.windSpeed * (Util.getRndInteger(75, 126) / 100)), // between 75% and 125% of config value
    windDirection: generateWindDirection(),
    rainLevel: nextData.rainLevel,
    temperature: Util.getRndInteger(...nextData.temperatureRange),
  };
};

const chooseTransitionForType = (type: WeatherSync.Type) => {
  // Get all enabled possible transitions for type
  const transitions = WEATHERS[type].transitions.filter(t => isTypeEnabled(t.type));

  let newType: WeatherSync.Type = 'CLEAR';
  if (transitions.length === 1) {
    newType = transitions[0].type;
  } else if (transitions.length > 1) {
    let rng = Util.getRndInteger(0, 101);

    for (const t of transitions) {
      if (rng < t.percentage) {
        newType = t.type;
        break;
      }

      rng -= t.percentage;
    }
  }

  return newType;
};

const isTypeEnabled = (type: WeatherSync.Type) => WEATHERS[type].enabled;

const getRandomEnabledType = () => {
  const enabledTypes = Object.entries(WEATHERS).reduce<WeatherSync.Type[]>((acc, [type, data]) => {
    if (data.enabled) {
      acc.push(type as WeatherSync.Type);
    }
    return acc;
  }, []);
  return enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
};

// Wind dir is in radians
const generateWindDirection = () => {
  const rng = Util.getRndDecimal(0, 2);
  return rng * Math.PI;
};

export const overideCurrentWeather = (type: string) => {
  if (!(type in WEATHERS)) {
    console.error(`${type} is not a valid weathertype`);
    return;
  }

  skipNextTransition = true;

  const weather = generateWeatherData(type as WeatherSync.Type);
  setCurrentWeather(weather);
};
