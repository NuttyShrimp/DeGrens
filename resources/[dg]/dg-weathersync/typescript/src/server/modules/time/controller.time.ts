import { timeLogger } from './logger.time';
import {
  freezeTime,
  getCurrentHour,
  getCurrentMinute,
  getCurrentTime,
  isTimeFrozen,
  setCurrentTime,
} from './service.time';

global.exports('setCurrentTime', (time: number) => {
  setCurrentTime(time);
  timeLogger.info(`Time has been manually set to ${time}`);
});
global.exports('getCurrentTime', getCurrentTime);
global.exports('getCurrentHour', getCurrentHour);
global.exports('getCurrentMinute', getCurrentMinute);
global.exports('freezeTime', freezeTime);
global.exports('isTimeFrozen', isTimeFrozen);
