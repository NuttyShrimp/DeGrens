import { onEvent as onDebuggerEvent } from './debugger/events';
import { onEvent as onPanelEvent } from './panel/events';
import { setInfo } from './panel/reports/infoStore';

const msgListener = (evt: MessageEvent) => {
  onPanelEvent(evt);
  onDebuggerEvent(evt);

  switch (evt.data.action) {
    case 'init-panel': {
      setInfo(evt.data.data);
      break;
    }
  }
};

window.addEventListener('message', msgListener);
