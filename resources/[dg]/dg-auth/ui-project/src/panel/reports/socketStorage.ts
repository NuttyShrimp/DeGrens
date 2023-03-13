const openSockets: Record<number, WebSocket> = {};
const closingWS: Set<WebSocket> = new Set();

export const hasOpenWS = (wsid: number) => {
  return !!openSockets?.[wsid];
};

export const getWS = (wsid: number) => {
  return openSockets[wsid];
};

export const setWS = (wsid: number, socket: WebSocket) => {
  openSockets[wsid] = socket;
};

export const removeWS = (ws: WebSocket) => {
  closingWS.delete(ws);
};

export const closeWS = (wsid: number) => {
  const ws = openSockets[wsid];
  delete openSockets[wsid];
  closingWS.add(ws);
};
