import { Util } from '@dgx/server';
import { DEFAULT_DURATION, WEATHERS } from './constants.weather';
import { weatherLogger } from './logger.weather';
import { getRandomWindDirection } from './helpers.weather';

let currentWeather: WeatherSync.Weather;
let scheduledChange: NodeJS.Timeout;

export const getCurrentWeather = () => currentWeather;
const setCurrentWeather = (weather: WeatherSync.Weather, skipTransition = false) => {
  currentWeather = weather;
  GlobalState.weather = { weather, skipTransition } satisfies WeatherSync.WeatherStateBag;

  weatherLogger.info(
    `${weather.type} | ${(weather.windSpeed * 3.6).toFixed(2)}kph wind | ${(weather.rainLevel ?? 0) * 100}% rain`
  );
};

export const startWeatherScheduling = () => {
  const startType = getStartType();
  const { weather, duration } = buildWeatherData(startType);

  setCurrentWeather(weather, true);
  scheduleWeatherChange(duration);
};

const scheduleWeatherChange = (minutes: number) => {
  scheduledChange = setTimeout(
    () => {
      const nextType = chooseTransitionForType(currentWeather.type);
      const { weather, duration } = buildWeatherData(nextType);
      setCurrentWeather(weather);
      scheduleWeatherChange(duration);
    },
    minutes * 60 * 1000
  );
};

export const buildWeatherData = (type: WeatherSync.Type): { duration: number; weather: WeatherSync.Weather } => {
  const data = WEATHERS[type];
  return {
    duration: data.duration ?? DEFAULT_DURATION,
    weather: {
      type: type,
      windSpeed: Math.round(data.windSpeed * (Util.getRndInteger(75, 126) / 100)), // between 75% and 125% of config value
      windDirection: getRandomWindDirection(),
      rainLevel: data.rainLevel,
    },
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

const getStartType = () => {
  const enabledTypes = (Object.entries(WEATHERS) as ObjEntries<typeof WEATHERS>)
    .filter(([_, w]) => w.enabled && !w.cannotBeFirst)
    .map(([t, _]) => t);
  return enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
};

export const overideCurrentWeather = (type: string, skipTransition: boolean) => {
  if (!(type in WEATHERS)) {
    console.error(`${type} is not a valid weathertype`);
    return;
  }

  const { weather, duration } = buildWeatherData(type as WeatherSync.Type);

  setCurrentWeather(weather, skipTransition);

  clearTimeout(scheduledChange);
  scheduleWeatherChange(duration);
};
