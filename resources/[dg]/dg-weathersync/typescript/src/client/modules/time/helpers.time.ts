export const calculateHoursAndMinutes = (time: number) => ({ hour: Math.floor(time / 60), minute: time % 60 });
