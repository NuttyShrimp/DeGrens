import { freezeWeather, setGlobalWeather } from './service.weather';

AddStateBagChangeHandler('weather', 'global', (_: string, __: string, state: WeatherSync.WeatherStateBag) => {
  setGlobalWeather(state.weather, state.skipTransition);
});

global.exports('freezeWeather', freezeWeather);
