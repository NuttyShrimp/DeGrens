import { Util } from '@dgx/server';
import { HOURS_PER_DAY } from './constants.time';

let currentTime = 0;

export const initializeTime = () => {
  // Start time at current irl time or 12h if devserver
  if (Util.isDevEnv()) {
    setCurrentTime(500);
  } else {
    const date = new Date();
    const minutes = date.getHours() * 60 + date.getMinutes();
    setCurrentTime(minutes);
  }

  // Start time thread
  const milliSecondsPerGameMinute = (60 / (24 / HOURS_PER_DAY)) * 1000;
  setInterval(() => {
    let newTime = currentTime + 1;
    if (newTime >= 1440) newTime = 0;
    setCurrentTime(newTime);
  }, milliSecondsPerGameMinute);
};

export const setCurrentTime = (time: number) => {
  currentTime = Math.max(0, Math.min(time, 1440 - 1));
  GlobalState.time = currentTime;
};

export const getCurrentTime = () => currentTime;
export const getCurrentHour = () => Math.floor(currentTime / 60);
export const getCurrentMinute = () => currentTime % 60;
