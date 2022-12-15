let currentTime = 0;
let timeFrozen = false;

export const setGameTime = (time: number) => {
  if (timeFrozen) return;
  currentTime = time;
  const { hour, minute } = calculateHoursAndMinutes(time);
  emit('weathersync:timeUpdated', hour, minute);
};

export const startGameTimeThread = () => {
  syncTime();

  // Set time every 0.1 second, otherwise moon/suncycle will look scuffed
  setInterval(() => {
    const { hour, minute } = calculateHoursAndMinutes(currentTime);
    NetworkOverrideClockTime(hour, minute, 0);
  }, 100);
};

export const freezeTime = (freeze: boolean, atMinutes?: number) => {
  if (!freeze) {
    timeFrozen = false;
    syncTime();
  } else {
    if (atMinutes != undefined) {
      setGameTime(atMinutes);
    }
    timeFrozen = true;
  }
};

const syncTime = () => {
  const stateTime = GlobalState.time as number;
  if (stateTime == undefined) {
    console.error('Failed to get time from globalstate');
  }
  setGameTime(stateTime);
};

const calculateHoursAndMinutes = (time: number) => {
  return {
    hour: Math.floor(time / 60),
    minute: time % 60,
  };
};
