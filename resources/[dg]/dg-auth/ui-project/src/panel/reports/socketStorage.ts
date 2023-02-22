const openSockets: Record<number, WebSocket> = {};

export const hasOpenWS = (wsid: number) => {
  return !!openSockets?.[wsid];
};

export const getWS = (wsid: number) => {
  return openSockets[wsid];
};

export const setWS = (wsid: number, socket: WebSocket) => {
  openSockets[wsid] = socket;
};

export const removeWS = (wsid: number) => {
  delete openSockets[wsid];
};