import { nuiAction } from '../events';

let debugSocket: WebSocket | null = null;
let debugToken: string | null = null;

export const openSocket = (_token: string) => {
  if (debugSocket) {
    closeSocket();
  }
  debugToken = _token;
  const ws = new WebSocket('wss://127.0.0.1:2371');
  if (ws === null) {
    console.error('Failed to open debug socket, Make sure your debug tool is running');
    return;
  }
  debugSocket = ws;

  ws.addEventListener('open', () => {
    console.log('Successfully opened debug WS');
    ws.send(JSON.stringify({ token: _token }));
    nuiAction('debugger/connected');
  });

  ws.addEventListener('close', () => {
    setTimeout(() => {
      if (debugToken !== _token) return;
      openSocket(_token);
    }, 1000);
    console.log('Closed the debug socket');
    debugSocket = null;
  });
};

export const closeSocket = () => {
  if (!debugSocket) return;
  debugSocket.close(1000, 'bye');
  debugSocket = null;
  debugToken = null;
};

export const sendEvents = (events: any) => {
  if (!debugSocket) {
    throw new Error('No open debug socket');
  }
  debugSocket.send(JSON.stringify(events));
};
