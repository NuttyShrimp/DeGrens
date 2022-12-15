import { freezeWeather, setGameWeather } from './service.weather';

AddStateBagChangeHandler(
  'weather',
  'global',
  (bagName: string, keyName: string, weather: WeatherSync.WeatherStateBag) => {
    setGameWeather(weather, weather.skipTransition);
  }
);

global.exports('freezeWeather', freezeWeather);
