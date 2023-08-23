import { RPC, Util } from '@dgx/client';
import { DEFAULT_WEATHER, TRANSITION_TIME } from './constants.weather';

let globalWeather: WeatherSync.Weather = { ...DEFAULT_WEATHER };
let weatherFrozen = false;

let currentWeather: WeatherSync.Weather = { ...DEFAULT_WEATHER };
let changeResolver: ((val: boolean) => void) | null = null;

export const initializeWeather = () => {
  let stateWeather = (GlobalState.weather as WeatherSync.WeatherStateBag).weather;
  if (stateWeather == undefined) {
    console.error('Failed to get weather from globalstate');
    stateWeather = { ...DEFAULT_WEATHER };
  }
  setGlobalWeather(stateWeather, true);
};

export const freezeWeather = (freeze: boolean, type?: WeatherSync.Type) => {
  if (!freeze) {
    weatherFrozen = false;
    setGameWeather(globalWeather, true);
    return;
  }

  weatherFrozen = true;
  if (type != undefined) {
    RPC.execute<WeatherSync.Weather>('weathersync:weather:buildWeather', type).then(weather => {
      if (!weather) return;
      setGameWeather(weather, true);
    });
  }
};

const setGameWeather = async (weather: WeatherSync.Weather, skipTransition = false) => {
  if (changeResolver !== null) {
    changeResolver(false);
  }

  if (currentWeather.type !== weather.type) {
    const transitionTime = skipTransition ? 1 : TRANSITION_TIME;
    SetWeatherTypeOvertimePersist(weather.type, transitionTime);

    const continueChange = await new Promise<boolean>(res => {
      changeResolver = res;
      setTimeout(() => {
        res(true);
      }, transitionTime * 1000);
    });
    changeResolver = null;
    if (!continueChange) return;

    ClearOverrideWeather();
    SetWeatherTypePersist(weather.type);
    SetWeatherTypeNow(weather.type);
    SetWeatherTypeNowPersist(weather.type);
  }

  SetWindSpeed(weather.windSpeed);
  SetWindDirection(weather.windDirection);

  if (weather.rainLevel !== undefined) {
    SetRainLevel(weather.rainLevel);
  } else {
    SetRainLevel(-1);
  }

  currentWeather = weather;
};

export const setGlobalWeather = (weather: WeatherSync.Weather, skipTransition: boolean) => {
  globalWeather = weather;
  emit('weathersync:weatherUpdated', weather.type);

  if (!weatherFrozen) {
    setGameWeather(weather, skipTransition);
  }
};
