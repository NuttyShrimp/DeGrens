import { startGameTimeThread } from 'modules/time/service.time';
import { initializeWeather } from 'modules/weather/service.weather';

import './modules/time';
import './modules/weather';

setImmediate(() => {
  startGameTimeThread();
  initializeWeather();
});
