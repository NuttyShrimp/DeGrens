let eventRunning: string | null = null;

export const toggleEvent = (event: string) => {
  eventRunning = eventRunning === event ? null : event;
};
export const getRunningEvent = () => eventRunning;
export const isAnyEventRunning = () => eventRunning !== null;
