import { getCurrentHour, getCurrentMinute, getCurrentTime, setCurrentTime } from './service.time';

global.exports('setCurrentTime', setCurrentTime);
global.exports('getCurrentTime', getCurrentTime);
global.exports('getCurrentHour', getCurrentHour);
global.exports('getCurrentMinute', getCurrentMinute);
