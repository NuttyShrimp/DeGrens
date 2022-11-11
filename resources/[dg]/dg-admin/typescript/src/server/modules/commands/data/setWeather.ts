import { Inputs } from '../../../enums/inputs';

interface SetWeatherData {
  WeatherType: UI.Weather;
}

export const setWeather: CommandData = {
  name: 'setWeather',
  role: 'staff',
  log: 'has set weather',
  target: false,
  isClientCommand: false,
  handler: (_, args: SetWeatherData) => {
    if (!args.WeatherType.name) return;
    global.exports['dg-weathersync'].setWeather(args.WeatherType.name);
  },
  UI: {
    title: 'Set Weather',
    info: {
      inputs: [Inputs.Weather],
    },
  },
};
