import { Notifications, Util, Weather } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

interface SetWeatherData {
  WeatherType: UI.Weather;
  skipTransition?: boolean;
}

export const setWeather: CommandData = {
  name: 'setWeather',
  role: 'staff',
  log: 'has set weather',
  target: false,
  isClientCommand: false,
  handler: (caller, args: SetWeatherData) => {
    if (!args.WeatherType.name) return;

    if (!Util.debounce('admin-weather-change', 10000)) {
      Notifications.add(caller.source, 'Het weer wordt momenteel al aangepast', 'error');
      return;
    }

    Weather.setCurrentWeather(args.WeatherType.name, !!args.skipTransition);
  },
  UI: {
    title: 'Set Weather',
    info: {
      inputs: [Inputs.Weather],
      checkBoxes: ['skipTransition'],
    },
  },
};
