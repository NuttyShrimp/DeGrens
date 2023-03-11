import { initializeTime } from 'modules/time/service.time';
import { validateWeatherConfig } from 'modules/weather/constants.weather';
import { startWeatherScheduling } from 'modules/weather/service.weather';

import './modules/time';
import './modules/weather';

setImmediate(() => {
  initializeTime();
  validateWeatherConfig();
  startWeatherScheduling();
});
