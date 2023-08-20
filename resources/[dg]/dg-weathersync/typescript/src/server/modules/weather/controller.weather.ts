import { RPC } from '@dgx/server';
import { WEATHERS } from './constants.weather';
import { buildWeatherData, getCurrentWeather, overideCurrentWeather } from './service.weather';

global.exports('getWeatherTypes', () => Object.keys(WEATHERS));
global.exports('getCurrentWeather', getCurrentWeather);
global.exports('setCurrentWeather', overideCurrentWeather);

RPC.register('weathersync:weather:buildWeather', (_, type: WeatherSync.Type) => buildWeatherData(type).weather);
