import { RPC } from '@dgx/client/classes';
import { Util } from '@dgx/shared';
import { TRANSITION_TIME } from './constants.weather';

let weatherFrozen = false;

let currentWeather: WeatherSync.Weather = {
  type: 'CLEAR',
  windSpeed: 0,
  windDirection: 0,
  temperature: 80,
};

export const initializeWeather = () => {
  syncWeather();
};

export const freezeWeather = (freeze: boolean, type?: WeatherSync.Type) => {
  if (!freeze) {
    weatherFrozen = false;
    syncWeather();
  } else {
    if (type != undefined) {
      RPC.execute<WeatherSync.Weather>('weathersync:weather:buildWeather', type).then(weather => {
        if (!weather) return;
        setGameWeather(weather, true);
        weatherFrozen = true;
      });
    } else {
      weatherFrozen = true;
    }
  }
};

const syncWeather = () => {
  const stateTime = GlobalState.weather as WeatherSync.Weather;
  if (stateTime == undefined) {
    console.error('Failed to get weather from globalstate');
  }
  setGameWeather(stateTime, true);
};

export const setGameWeather = async (weather: WeatherSync.Weather, skipTransition = false) => {
  if (weatherFrozen) return;

  if (currentWeather.type !== weather.type) {
    const time = skipTransition ? 0 : TRANSITION_TIME;
    SetWeatherTypeOvertimePersist(weather.type, time);
    await Util.Delay(time * 1000);
    currentWeather = weather;
    emit('weathersync:weatherUpdated', weather.type);
  }

  ClearOverrideWeather();
  ClearWeatherTypePersist();

  SetWeatherTypePersist(weather.type);
  SetWeatherTypeNow(weather.type);
  SetWeatherTypeNowPersist(weather.type);

  SetWindSpeed(weather.windSpeed);
  SetWindDirection(weather.windDirection);

  if (weather.rainLevel) {
    SetRainLevel(weather.rainLevel);
  } else {
    SetRainLevel(-1);
  }
};
