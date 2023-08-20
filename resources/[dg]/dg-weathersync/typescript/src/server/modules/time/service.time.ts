import { Util } from '@dgx/server';
import { HOURS_PER_DAY } from './constants.time';
import { timeLogger } from './logger.time';

let currentTime = 0;
let timeThread: NodeJS.Timer | null = null;

export const initializeTime = () => {
  const startTime = Util.isDevEnv() ? 12 * 60 : Util.getRndInteger(1, 1440);
  setCurrentTime(startTime);
  startTimeThread();
};

export const setCurrentTime = (time: number) => {
  currentTime = Math.max(0, Math.min(time, 1440 - 1));
  GlobalState.time = currentTime;
};

export const getCurrentTime = () => currentTime;
export const getCurrentHour = () => Math.floor(currentTime / 60);
export const getCurrentMinute = () => currentTime % 60;

export const freezeTime = (freeze: boolean, atMinutes?: number) => {
  if (!freeze) {
    timeLogger.info(`Time has been unfrozen`);
    startTimeThread();
    return;
  }

  clearTimeThread();
  timeLogger.info(`Time has been frozen${atMinutes != undefined ? ` at ${atMinutes}` : ''}`);
  if (atMinutes != undefined) {
    setCurrentTime(atMinutes);
  }
};

const startTimeThread = () => {
  if (timeThread != null) return;

  // Start time thread
  const milliSecondsPerGameMinute = (60 / (24 / HOURS_PER_DAY)) * 1000;
  timeThread = setInterval(() => {
    let newTime = currentTime + 1;
    if (newTime >= 1440) newTime = 0;
    setCurrentTime(newTime);
  }, milliSecondsPerGameMinute);
};

const clearTimeThread = () => {
  if (timeThread == null) return;

  clearInterval(timeThread);
  timeThread = null;
};

export const isTimeFrozen = () => timeThread === null;
