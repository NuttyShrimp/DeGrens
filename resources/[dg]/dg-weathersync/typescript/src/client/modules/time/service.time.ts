import { calculateHoursAndMinutes } from './helpers.time';

let globalTime = 0;
let timeFrozen = false;

export const startGameTimeThread = () => {
  NetworkOverrideClockMillisecondsPerGameMinute(0); // this pauses native time cycle

  let stateTime: number | undefined = GlobalState.time;
  if (stateTime == undefined) {
    console.error('Failed to get time from globalstate');
    stateTime = 0;
  }
  setGlobalTime(stateTime);
};

export const freezeTime = (freeze: boolean, atMinutes?: number) => {
  if (!freeze) {
    timeFrozen = false;
    setNativeTime(globalTime);
    return;
  }

  timeFrozen = true;
  if (atMinutes !== undefined) {
    setNativeTime(atMinutes);
  }
};

export const setGlobalTime = (time: number) => {
  globalTime = time;
  if (!timeFrozen) {
    setNativeTime(globalTime);
  }

  const { hour, minute } = calculateHoursAndMinutes(time);
  emit('weathersync:timeUpdated', hour, minute);
};

const setNativeTime = (time: number) => {
  const { hour, minute } = calculateHoursAndMinutes(time);
  NetworkOverrideClockTime(hour, minute, 0);
};
