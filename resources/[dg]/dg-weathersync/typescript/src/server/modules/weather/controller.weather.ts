import { RPC } from '@dgx/server';
import { WEATHERS } from './constants.weather';
import { generateWeatherData, getCurrentWeather, overideCurrentWeather } from './service.weather';

global.exports('getWeatherTypes', () => Object.keys(WEATHERS));
global.exports('getCurrentWeather', getCurrentWeather);
global.exports('setCurrentWeather', overideCurrentWeather);

RPC.register('weathersync:weather:buildWeather', (src: number, type: WeatherSync.Type) => {
  return generateWeatherData(type);
});
